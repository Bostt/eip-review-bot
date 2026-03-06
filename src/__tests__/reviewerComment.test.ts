import {
    FileRuleCommentData,
    generateReviewerComment,
} from "../reviewerComment";

describe("generateReviewerComment", () => {
    it("wraps editor reviewers in backticks to suppress pings", () => {
        const filesToRules: { [key: string]: FileRuleCommentData[] } = {
            "EIPS/eip-1.md": [
                {
                    min: 2,
                    requesting: ["lightclient", "samwilsn", "g11tech"],
                    mention_reviewers: false,
                },
            ],
        };

        const comment = generateReviewerComment(filesToRules);
        expect(comment).toContain(
            "Requires 2 more reviewers from `@g11tech`, `@lightclient`, `@samwilsn`",
        );
    });

    it("keeps real @mentions for author reviewers", () => {
        const filesToRules: { [key: string]: FileRuleCommentData[] } = {
            "EIPS/eip-1.md": [
                {
                    min: 1,
                    requesting: ["vitalik"],
                    mention_reviewers: true,
                },
                {
                    min: 2,
                    requesting: ["lightclient", "samwilsn", "g11tech"],
                    mention_reviewers: false,
                },
            ],
        };

        const comment = generateReviewerComment(filesToRules);
        expect(comment).toContain("Requires 1 more reviewers from @vitalik");
        expect(comment).toContain(
            "Requires 2 more reviewers from `@g11tech`, `@lightclient`, `@samwilsn`",
        );
    });

    it("pings an editor as an author when they authored the EIP", () => {
        const filesToRules: { [key: string]: FileRuleCommentData[] } = {
            "EIPS/eip-1.md": [
                {
                    min: 1,
                    requesting: ["samwilsn"],
                    mention_reviewers: true,
                },
                {
                    min: 2,
                    requesting: ["lightclient", "samwilsn", "g11tech"],
                    mention_reviewers: false,
                },
            ],
        };

        const comment = generateReviewerComment(filesToRules);
        expect(comment).toContain("Requires 1 more reviewers from @samwilsn");
        expect(comment).toContain(
            "Requires 2 more reviewers from `@g11tech`, `@lightclient`, `@samwilsn`",
        );
    });

    it("dedupes rules with the same reviewers and keeps the first", () => {
        const filesToRules: { [key: string]: FileRuleCommentData[] } = {
            "EIPS/eip-1.md": [
                {
                    min: 1,
                    requesting: ["bob", "alice"],
                    mention_reviewers: false,
                },
                {
                    min: 2,
                    requesting: ["alice", "bob"],
                    mention_reviewers: false,
                },
            ],
        };

        const comment = generateReviewerComment(filesToRules);
        expect(comment.match(/Requires/g)?.length).toBe(1);
        expect(comment).toContain(
            "Requires 1 more reviewers from `@alice`, `@bob`",
        );
    });

    it("does not mutate requesting reviewer arrays", () => {
        const requesting = ["bob", "alice"];
        const filesToRules: { [key: string]: FileRuleCommentData[] } = {
            "EIPS/eip-1.md": [
                {
                    min: 1,
                    requesting,
                    mention_reviewers: false,
                },
            ],
        };

        generateReviewerComment(filesToRules);
        expect(requesting).toEqual(["bob", "alice"]);
    });

    it("collapses duplicate reviewer sets and prefers ping format", () => {
        const filesToRules: { [key: string]: FileRuleCommentData[] } = {
            "EIPS/eip-1.md": [
                {
                    min: 1,
                    requesting: ["samwilsn"],
                    mention_reviewers: false,
                },
                {
                    min: 1,
                    requesting: ["samwilsn"],
                    mention_reviewers: true,
                },
            ],
        };

        const comment = generateReviewerComment(filesToRules);
        expect(comment.match(/Requires/g)?.length).toBe(1);
        expect(comment).toContain("Requires 1 more reviewers from @samwilsn");
        expect(comment).not.toContain("`@samwilsn`");
    });
});
