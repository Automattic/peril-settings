jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import checkTracks from "../org/pr/check-tracks";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.message = jest.fn().mockReturnValue(true);

    let diffString : string = "diff --git a/WooCommerce/src/main/kotlin/com/woocommerce/android/push/NotificationHandler.kt a/WooCommerce/src/main/kotlin/com/woocommerce/android/push/NotificationHandler.kt\n";
    diffString += "index eb1a3f999dc..87ac8c3793c 100644\n";
    diffString += "--- a/WooCommerce/src/main/kotlin/com/woocommerce/android/push/NotificationHandler.kt";
    diffString += "+++ b/WooCommerce/src/main/kotlin/com/woocommerce/android/push/NotificationHandler.kt";
    diffString += "val latestGCMToken = preferences.getString(FCMRegistrationIntentService.WPCOM_PUSH_DEVICE_TOKEN, null)\n";
    diffString += "--- AnalyticsTracker.track(stat, properties)";
    diffString += "+++ AnalyticsTracker.track(stat2, properties)";
    const mockDiffFromFile = jest.fn();
    mockDiffFromFile.mockReturnValue(diffString);

    dm.danger = {
        git: {
            modified_files: ["AnalyticsTracker.kt"],
            created_files: [],
            deleted_files: [],
            diffForFile: mockDiffFromFile
        },
        github: {
            pr: {
                head: {
                    ref: "test-branch",
                }
            },
            thisPR: {
                repo: "test-wordpress-mobile",
                number: -1,
            },
        },
    };
});

describe("tracks checks Android", () => {
    it("adds instructions when PR contains changes in AnalyticsTracker.kt", async () => {
        await checkTracks();
        
        // Check that the instructions appear correct.
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining("This PR contains changes to Tracks-related logic. Please ensure the following are completed"));
    })

    it("adds instructions when PR contains changes in LoginAnalyticsTracker.kt", async () => {
        // Update mocks
        dm.danger.git.modified_files = ["LoginAnalyticsTracker.kt"];
        
        await checkTracks();
        
        // Check that the instructions appear correct.
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining("This PR contains changes to Tracks-related logic. Please ensure the following are completed"));
    })

})

describe("tracks checks iOS", () => {
    it("adds instructions when PR contains changes in WooAnalyticsStat.swift", async () => {
        // Update mocks
        dm.danger.git.modified_files = ["WooAnalyticsStat.swift"];
        
        await checkTracks();
        
        // Check that the instructions appear correct.
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining("This PR contains changes to Tracks-related logic. Please ensure the following are completed"));
    })

})
