import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { markOnboardingComplete } from "../utils/onboarding";
import { useNavigate } from "react-router-dom";

interface OnboardingTourProps {
    /**
     * Callback function called when the tour is completed or skipped
     */
    onComplete?: () => void;
}

/**
 * OnboardingTour Component
 * 
 * Provides a 4-step interactive tour for first-time users using Driver.js.
 * The tour guides users through:
 * 1. Dashboard - Overview of carbon credit portfolio
 * 2. Carbon Wallet - Manage wallet balance
 * 3. Marketplace - Browse and purchase credits
 * 4. User Profile - Account settings
 * 
 * Features:
 * - Light blue theme matching the brand
 * - Next/Back/Skip navigation buttons
 * - Arrow pointers for each step
 * - Auto-starts on mount
 * - Saves completion state to localStorage
 */
const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Small delay to ensure DOM elements are rendered
        const timeout = setTimeout(() => {
            startTour();
        }, 1000);

        return () => clearTimeout(timeout);
    }, []); // Run only once on mount

    const handleComplete = () => {
        markOnboardingComplete();
        if (onComplete) {
            onComplete();
        }
    };

    const startTour = () => {
        const driverObj = driver({
            // Show close button
            showButtons: ["next", "previous", "close"],

            // Show progress indicator
            showProgress: true,

            // Steps configuration
            steps: [
                {
                    element: "#dashboard-section",
                    popover: {
                        title: "Welcome to Your Dashboard! 🎉",
                        description: "This is your command center. Track your carbon credit portfolio, view recent transactions, and monitor wallet balance all in one place.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#wallet-section",
                    popover: {
                        title: "Carbon Wallet 💰",
                        description: "Manage your wallet balance here. Top up funds to purchase carbon credits and view your complete transaction history.",
                        side: "bottom",
                        align: "start",
                        onNextClick: () => {
                            navigate("/wallet");
                            driverObj.moveNext();
                        },
                    },
                },
                {
                    element: "#marketplace-section",
                    popover: {
                        title: "Marketplace 🌱",
                        description: "Browse verified carbon credit projects. Filter by price, location, and benefits to find the perfect credits for your sustainability goals.",
                        side: "bottom",
                        align: "start",
                        onNextClick: () => {
                            navigate("/marketplace");
                            driverObj.moveNext();
                        },
                    },
                },
                {
                    element: "#profile-section",
                    popover: {
                        title: "User Profile ⚙️",
                        description: "Update your account details, manage organization info, and configure your platform preferences. You're all set to start trading!",
                        side: "bottom",
                        align: "start",
                        // No onNextClick for the last step - let it complete naturally
                    },
                },
            ],

            // Callbacks
            onDestroyStarted: () => {
                // When user clicks close or completes the tour
                handleComplete();
            },

            onDestroyed: () => {
                // Tour finished (either completed or skipped)
                handleComplete();
            },

            // Prevent clicking outside to close
            allowClose: true,

            // Overlay opacity
            overlayOpacity: 0.7,

            // Smooth animation
            animate: true,

            // Custom button text
            nextBtnText: "Next →",
            prevBtnText: "← Back",
            doneBtnText: "Get Started! ✨",

            // Don't allow keyboard navigation to prevent accidental skips
            allowKeyboardControl: false,
        });

        // Start the tour
        driverObj.drive();
    };

    // This component doesn't render anything visible
    // The tour is controlled by Driver.js
    return null;
};

export default OnboardingTour;
