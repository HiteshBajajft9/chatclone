const keyStrokeSound = [
  new Audio("sounds/keystroke1.mp3"),
  new Audio("sounds/keystroke2.mp3"),
  new Audio("sounds/keystroke3.mp3"),
  new Audio("sounds/keystroke4.mp3"),
];

function useKeySound() {
  const playRandomKeyStrokeSound = () => {
    const randomIndex = Math.floor(Math.random() * keyStrokeSound.length);

    keyStrokeSound[randomIndex].currentTime = 0; // Reset to start for quick successive plays
    keyStrokeSound[randomIndex].play().catch((error) => {
      console.log("Audio play failed:", error);
    });
  };

  return { playRandomKeyStrokeSound };
}

export default useKeySound;
