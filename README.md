![hackatime badge](https://hackatime-badge.hackclub.com/U0857UWECTS/note-taker)

# Note Taker
An open-source AI note taker 


## Live Demo
Live Demo is coming soon...

## Features
- AI-powered note-taking with OpenAI whisper-1 integration
- Limits on how much time a user can record


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