import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);

    if(decision.isDenied()) {
        if(decision.reason.isRateLimit()) {
            return res.status(429).json({ error: "Too Many Requests" });
        } else if (decision.reason.isBot()) {
            return res.status(403).json({ error: "No bots allowed" });
        } else {
            return res.status(403).json({ error: "Forbidden" });
        }
    // } else if (decision.ip.isHosting()) {
    //     // Requests from hosting IPs are likely from bots, so they can usually be
    //     // blocked. However, consider your use case - if this is an API endpoint
    //     // then hosting IPs might be legitimate.
    //     // https://docs.arcjet.com/blueprints/vpn-proxy-detection
    //     res.writeHead(403, { "Content-Type": "application/json" });
    //     res.end(JSON.stringify({ error: "Forbidden" }));
    }
    if (decision.results.some(isSpoofedBot)) {
        // Paid Arcjet accounts include additional verification checks using IP data.
        // Verification isn't always possible, so we recommend checking the decision
        // separately.
        // https://docs.arcjet.com/bot-protection/reference#bot-verification
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden" }));
    }

    next();
  } catch (error) {
    console.error("Error in Arcjet middleware:", error);
    next();
  }
};