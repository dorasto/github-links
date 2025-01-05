<!-- DORAS-LINKS-START -->
<!-- DORAS-LINKS-END -->

# Example usage

```yml
name: Update Doras Links

on:
    schedule:
        - cron: "0 0 * * *" # Updates daily

env:
    DORAS_USERNAME: "your-username-here" # Set your username here for scheduled runs

jobs:
    update-readme:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Generate Doras Links
              uses: dorasto/github-links@v1
              with:
                  username: ${{ env.DORAS_USERNAME }}
```
