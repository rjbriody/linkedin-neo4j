linkedin-neo4j
==============
This project is an example showing how to:
- Load a linkedin network into neo4j using the linkedin developer API. You can easily run this multiple times with different users to build an aggregate network.
- Serve the network via node.js
- Display the network using sigma.js

Assumptions:
- You have followed the instructions to obtain the linkedin developer credentials as described here: https://developer.linkedin.com/documents/authentication 

Coming Soon (Maybe?)
- Ability to automatically run community detection (modularity) using Gephi Toolkit. If anyone knows of other ways to do this please let me know. Message me or feel free to post suggestions on my blog: www.bobbriody.com.

Directories:
server: contains node.js server that can serve the network from neo4j to the client webpage
client: webpage that uses sigma.js to display the network
load: script that loads neo4j using the linkedin developer api
