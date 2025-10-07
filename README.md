![hackatime badge](https://hackatime-badge.hackclub.com/U0857UWECTS/note-taker)

# Note Taker
An open-source AI note taker 

### Disclaimer
Currently, only audio transcription works.
Converting into proper notes will be added within the next few updates


## Live Demo
Live Demo is available [here](https://note-taker-week-5-602158df7ec9.herokuapp.com/)!

## Features
- AI-powered note-taking with OpenAI whisper-1 integration
- Limits on how much time a user can record
    - Each user starts with 200 coins, each coin coresponds to ~1 second of transcription time (its low because it comes out of my credits)


## Instalation
Install using git with
```bash
git clone https://github.com/Nawab-AS/note-taker
cd ./note-taker
npm i
```


## Usage
1. Create a MongoDB cluster with appropriate access conditions (create a user with read/write permissions and allow IP access on your server)

2. Create a `.env` file which contains the following
```
SESSION_SECRET="<insert a session secret>"
OPENAI_API_KEY="<insert your openAI API key>"
MONGODB_URI="<insert your MongoDB connection URI>"
```

The session secret is random cryptographic key used to authenticate user logins

Optionally, you can specify the port with
```
PORT=<insert a port number>
```

> [!CAUTION]
> 
> Never share the contents of the `.env` file, this can lead to a breach of security.
It will also allow attackers to use your openAI API credits without your knowledge.


3. Run this command in the terminal to start the server
```bash
npm run start
```


## Screenshots

Home page

![home page](https://hc-cdn.hel1.your-objectstorage.com/s/v3/8858e68eefe271eb1153c6056f7a3b8b8df1e356_screen_shot_2025-10-06_at_11.18.46_pm.png)


## Contributing
Pull requests are welcome, but for major changes, please open an issue to discuss what you would like to change/add.


## Roadmap
- Convert transcriptions into proper notes
- Save notebooks with MongoDB Atlas
- Add seperation to notes with 'notebooks'
- Connect to MongoDB for login/signup
- Allow users to add their own API keys


## Questions or Concerns
For any questions or concerns please email me at support@nawab-as.software