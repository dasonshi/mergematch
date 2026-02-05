Refresh the GHL API documentation used by the ghl-docs MCP server.

Run the refresh script:
```
bash /Users/davidsonshine/Desktop/ghl-docs/refresh.sh
```

If the user passed arguments like `--full`, append them:
```
bash /Users/davidsonshine/Desktop/ghl-docs/refresh.sh --full
```

After the script completes:
1. Report the crawl summary (new, modified, unchanged, removed pages) from the output
2. Report the indexer results (endpoint counts, webhook events, scopes)
3. Remind the user: "Restart Claude Code to pick up the updated MCP docs (Ctrl+C and re-launch)."
