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

        if (!username) {
            throw new Error("Username is required");
        }

        const response = await axios.get(
            `https://doras.to/api/user/${username}/blocks?allblocks=true&filter=type:link`
        );

        const links = response.data;

        // Generate markdown
        let markdown = "## 🔗 My Links\n\n";
        markdown += '<div align="center">\n\n';

        links.forEach((link: DorasLink) => {
            if (link.show) {
                const iconName =
                    link.icon.split("/").pop()?.replace(".svg", "") || "";
                markdown += `<a href="${link.url}" target="_blank">`;
                markdown += `<img src="${link.icon}" width="32" height="32" alt="${link.name}" title="${link.name}" /></a>&nbsp;&nbsp;`;
            }
        });

        markdown += "\n\n</div>";

        // Read existing README
        const readmePath = "README.md";
        let readmeContent = fs.readFileSync(readmePath, "utf8");

        // Update content between markers
        readmeContent = readmeContent.replace(
            /<!-- DORAS-LINKS-START -->[\s\S]*<!-- DORAS-LINKS-END -->/,
            `<!-- DORAS-LINKS-START -->\n${markdown}\n<!-- DORAS-LINKS-END -->`
        );

        // Write updated README
        fs.writeFileSync(readmePath, readmeContent);

        // Set output
        core.setOutput("markdown", markdown);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
