import * as core from "@actions/core";
import * as exec from "@actions/exec";
import axios from "axios";
import * as fs from "fs";

interface DorasLink {
    url: string;
    icon: string;
    name: string;
    show: boolean;
    type: string;
}

async function run() {
    try {
        const username =
            core.getInput("username") || process.env.DORAS_USERNAME;

        core.info(`Processing for username: ${username}`);

        const response = await axios.get(
            `https://doras.to/api/user/${username}/blocks?allblocks=true&filter=type:link`
        );

        core.info(`Received ${response.data.length} links from API`);

        // Generate markdown
        let markdown = "## 🔗 My Links\n\n";
        markdown += '<div align="center">\n\n';

        response.data.forEach((link: DorasLink) => {
            if (link.show) {
                markdown += `<a href="${link.url}" target="_blank">`;
                markdown += `<img src="${link.icon}" width="32" height="32" alt="${link.name}" title="${link.name}" /></a>&nbsp;&nbsp;`;
                core.info(`Added link: ${link.name}`);
            }
        });

        markdown += "\n\n</div>";

        // Read and update README
        const readmePath = "README.md";
        core.info(`Reading from ${readmePath}`);

        const readmeContent = fs.readFileSync(readmePath, "utf8");
        const updatedContent = readmeContent.replace(
            /<!-- DORAS-LINKS-START -->[\s\S]*<!-- DORAS-LINKS-END -->/,
            `<!-- DORAS-LINKS-START -->\n${markdown}\n<!-- DORAS-LINKS-END -->`
        );

        fs.writeFileSync(readmePath, updatedContent);
        core.info("README.md updated successfully");

        core.setOutput("markdown", markdown);
        await exec.exec("git", [
            "config",
            "--local",
            "user.email",
            "action@github.com",
        ]);
        await exec.exec("git", [
            "config",
            "--local",
            "user.name",
            "GitHub Action",
        ]);
        await exec.exec("git", ["add", "README.md"]);
        await exec.exec("git", ["commit", "-m", "Update Doras links"]);
        await exec.exec("git", ["push"]);
        core.info("Changes committed and pushed");
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
