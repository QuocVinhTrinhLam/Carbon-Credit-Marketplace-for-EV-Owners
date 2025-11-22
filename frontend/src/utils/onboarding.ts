/**
 * Onboarding Helper Utilities
 * 
 * These utilities manage the first-time user onboarding tour state
 * using localStorage to track completion.
 */

const ONBOARDING_KEY = "onboarding_completed";

/**
 * Check if the onboarding tour should be shown to the user.
 * Returns true if the user has NOT completed the onboarding yet.
 * 
 * @returns {boolean} True if onboarding should show, false otherwise
 */
export const shouldShowOnboarding = (): boolean => {
    try {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        return completed === null || completed === undefined || completed !== "true";
    } catch (error) {
        console.error("Error checking onboarding status:", error);
        return false; // Default to not showing if localStorage fails
    }
};

/**
 * Mark the onboarding tour as completed.
 * This prevents the tour from showing again on subsequent visits.
 */
export const markOnboardingComplete = (): void => {
    try {
        localStorage.setItem(ONBOARDING_KEY, "true");
        console.log("Onboarding marked as complete");
    } catch (error) {
        console.error("Error marking onboarding complete:", error);
    }
};

/**
 * Reset the onboarding state.
 * Useful for testing or allowing users to replay the tour.
 */
export const resetOnboarding = (): void => {
    try {
        localStorage.removeItem(ONBOARDING_KEY);
        console.log("Onboarding state reset");
    } catch (error) {
        console.error("Error resetting onboarding:", error);
    }
};
