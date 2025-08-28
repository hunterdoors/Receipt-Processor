flowchart TD
    Start["Start"]
    Start --> Receive[Receive receipt submission via SMS or Email]
    Receive --> CheckType[Check file type]
    CheckType -->|PDF| Convert[Convert PDF to images]
    CheckType -->|Image| Extract[Perform data extraction]
    Convert --> Extract
    subgraph DailySync
        Sync[Daily import projects from Excel via MS Graph]
        Sync --> Store[Project list stored in Supabase]
    end
    Store -.-> Match{Project matched}
    Extract --> Match
    Match -->|Yes| Review[Admin dashboard review]
    Match -->|No| Notify[Prompt employee for project confirmation]
    Notify --> Confirmed[Employee confirms project]
    Confirmed --> Review
    Review -->|Approve| Post[Create expense in QuickBooks with attachment]
    Review -->|Edit| EditData[Admin edits extracted data]
    EditData -->|Save| Post
    Post --> Archive[Archive receipt]
    Archive --> Log[Audit log entry created]
    Log --> End["End"]
    Convert -->|Error| ErrorConv[Handle conversion error]
    Extract -->|Error| ErrorExtract[Handle extraction error]
    Sync -->|Error| ErrorSync[Handle sync error]