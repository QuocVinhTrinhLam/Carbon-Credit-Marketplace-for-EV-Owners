import { driver } from "driver.js";
import "driver.js/dist/driver.css";

/**
 * Manually trigger the onboarding tour
 * This version navigates between pages and highlights the correct sections
 * 
 * @param navigate - React Router navigate function
 * @param onComplete - Optional callback when tour completes
 */
export const triggerOnboardingTour = (
    navigate: (path: string) => void,
    onComplete?: () => void
) => {
    const driverObj = driver({
        showButtons: ["next", "previous", "close"],
        showProgress: true,

        steps: [
            {
                element: "#dashboard-section",
                popover: {
                    title: "Welcome to Your Dashboard! 🎉",
                    description: "This is your command center. Track your carbon credit portfolio, view recent transactions, and monitor wallet balance all in one place.",
                    side: "bottom",
                    align: "start",
                    onNextClick: async () => {
                        navigate("/wallet");
                        // Wait for navigation and page render
                        await new Promise(resolve => setTimeout(resolve, 600));
                        driverObj.moveNext();
                    },
                },
            },
            {
                element: "#wallet-section",
                popover: {
                    title: "Carbon Wallet 💰",
                    description: "Manage your wallet balance here. Top up funds to purchase carbon credits and view your complete transaction history.",
                    side: "bottom",
                    align: "start",
                    onNextClick: async () => {
                        navigate("/marketplace");
                        await new Promise(resolve => setTimeout(resolve, 600));
                        driverObj.moveNext();
                    },
                    onPrevClick: async () => {
                        navigate("/dashboard");
                        await new Promise(resolve => setTimeout(resolve, 600));
                        driverObj.movePrevious();
                    },
                },
            },
            {
                element: "#marketplace-section",
                popover: {
                    title: "Marketplace 🌱",
                    description: "Browse verified carbon credit projects. Filter by price, location, and benefits to find credits that match your sustainability goals.",
                    side: "bottom",
                    align: "start",
                    onNextClick: async () => {
                        navigate("/profile");
                        await new Promise(resolve => setTimeout(resolve, 600));
                        driverObj.moveNext();
                    },
                    onPrevClick: async () => {
                        navigate("/wallet");
                        await new Promise(resolve => setTimeout(resolve, 600));
                        driverObj.movePrevious();
                    },
                },
            },
            {
                element: "#profile-section",
                popover: {
                    title: "User Profile ⚙️",
                    description: "Visit your 'Profile' to update account details, manage organization info, and configure platform preferences. You're all set to start trading!",
                    side: "bottom",
                    align: "start",
                    onPrevClick: async () => {
                        navigate("/marketplace");
                        await new Promise(resolve => setTimeout(resolve, 600));
                        driverObj.movePrevious();
                    },
                },
            },
        ],

        onDestroyStarted: () => {
            // When user clicks X or finish
            driverObj.destroy();
            if (onComplete) {
                onComplete();
            }
        },

        onDestroyed: () => {
            // Final cleanup
            if (onComplete) {
                onComplete();
            }
            // Navigate back to dashboard when tour ends
            navigate("/dashboard");
        },

        allowClose: true,
        overlayOpacity: 0.5,
        animate: true,
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Finish Tutorial ✨",
        allowKeyboardControl: true, // ESC works
    });

    // Start the tour
    driverObj.drive();
};
