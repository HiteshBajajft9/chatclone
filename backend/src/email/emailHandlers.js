import { resendClient,sender } from "../lib/resend.js";
import { ACCOUNT_CREATION_TEMPLATE } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email , name, clientURL) => {
    try {
        const {data, error} = await resendClient.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Welcome to chatclone - Your Account Has Been Created!",
            html: ACCOUNT_CREATION_TEMPLATE(name, clientURL)
        });

        if (error) {
            console.error("Email send error:", error);
            return { success: false, error };
        }

        console.log("Welcome email sent successfully to:", email);
        return { success: true, data };
    } catch (err) {
        console.error("Exception sending welcome email:", err);
        return { success: false, error: err };
    }
    return { success: true, data };
};