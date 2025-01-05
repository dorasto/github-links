import * as core from "@actions/core";
import axios from "axios";

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

        const links: DorasLink[] = response.data;

        // Generate markdown
        let markdown = "## 🔗 My Links\n\n";
        markdown += '<div align="center">\n\n';

        links.forEach((link) => {
            if (link.show) {
                const iconName =
                    link.icon.split("/").pop()?.replace(".svg", "") || "";
                markdown += `<a href="${link.url}" target="_blank">`;
                markdown += `<img src="${link.icon}" width="32" height="32" alt="${link.name}" title="${link.name}" /></a>  `;
            }
        });

        markdown += "\n\n</div>";

        // Write to DORAS_LINKS environment variable
        core.setOutput("markdown", markdown);

        // Optional: Write directly to a file
        const fs = require("fs");
        fs.writeFileSync("doras-links.md", markdown);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
