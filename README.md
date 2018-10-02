2811ICT Assignment 1 Documentation

Git Repository –
For this project Github was used for version control. When any update was made to the source code of the project, it was uploaded to the Github repository so that it could be reverted to should another update break it, or should there be a need to revert back. As this never became a necessity, there was only ever one branch that was being updated, that being the master branch. Because that there was never really any need for multiple branches in this project, only one branch was maintained and updated. For them most part it was only really used as a cloud backup and version management between devices.

Data Structures used in Client and Server –
 In the new database system there were 3 collections that were used to represent all of the data. The collections consist of a users collection, groups collection, and a channelhistory collection. The users collection contains all of the data for each individual user, including the users name, password, email, level of permissions and also the users avatar. The groups collection contains the information for each of the individual groups, including the groups name, the groups channels and the groups admins as well. The channelhistory collection contains the history of messages for each individual channel, including the channels name and also an array containing all of the messages that have been sent in that channel. All of this information is kept in the server and then query'd and frequently updated usually at the same time it is queried. Ajax POST requests are sent to the server via Jquery and then sent on to the database and then returns the information back to the client.



Division of responsibilities of client and server:
For this program, the server is carrying out most of the work. On the users end, then only thing they ever really need to deal with is the user interface, and providing input. Other than that, the server does everything else. As there only two pages in operation, a login page and the chat page, routing is done client side through angular. Starting from the login page, when the user enters a username, the user authentication is carried out by the server, which will determine if the user exists and then send the clients data back to the client if the user does exist. Once the data has been returned, the data is saved for future use and then routed to the chat page. Everything on the chat page basically just exist to send a request to the server to get information or to alter information stored in the mongodb database. As this is a small program and is only going to be used by a very small group of people, the server is capable of accepting and responding to the small amount of requests with ease. To put it more simple the client is responsible for the storing of individual user data and keeping track of the groups and channels that the user can enter. And then server is responsible for retrieving those groups and channels, as well as altering the information about those groups and servers when asked to. As I ended up adding minor chat functionality, the server also receives information that is sent to the socket that allows the user to change channels and to send messages to the specified channel.

List of routes, return values and purpose:
/auth :
This route receives a username and password and checks the username and password against the user data stored in the users collection in the database for any matches, and then returns that data object the match was found in back to the client. This route exists as a way of authenticating a users existence on the system, as well as retrieving the users data in the case that they do exist.

/getGroups :
This route is called during initialization and accepts a single string as a group name, which is then sent to the server and then checked against the existing groups stored in the groups collection on the database for any matches. Should it find a match it will then retrieve the list of channels of the specified group and return them to the user to be displayed. This method exists to grab the initial group the user will load into when first entering the chat site.

/changeGroups :
This route does basically the same thing as /getGroups, except it also will change the current group name that is stored in the client session, as well as retrieving the new groups channels. The method takes a group name and then returns the channels available for that group. This method exists as a way of simply retrieving the channels of the group that the user wish to change to.

/newRoom :
This route accepts two parameters, both string. The first is the current group that the user creating a new room is in, and the second is the name of the new room. This can only be called by group admins and super admins. It sends a request to the server, which will find the data for the current group in the database, and then appending the new channel to the list of channels in that groups object. The name of the room is then returned to the user once the updated channels list has been saved back to the database. The clients browser will then add on the new room to the list of rooms that they can see. This route exists to make a new room in current group and allowing any other user who is a member of the group to join the channel.

/newGroup :
This route does the same thing as /newRoom, but just for groups instead. It takes two parameters, which is the name of the group, and then current user, which is then sent to the server. The server then creates a new object for the user and saves that object into the database collection for the groups. The group is given the name that the client specified and the user name that was sent by the server, which is the username stored in the clients session storage is then added to the admins of that group. This is all then saved in the database before the name of the group is then returned, and then added to the list of available groups for that user. This command is only accessible by a group or super admin. All this route does in reality is add a new entry to the groups collection to act as another group.

/addToGroup :
This route takes two parameters, one is the name of the user that you would like to add to the group and the other is group that the user is currently in. These are then sent to the server where the server first checks if the user exists, before adding the group to the users list of available groups in there user data.  The server will then return a true value when the user has been successfully added to the group. This command is only accessible to group and super admins. This route exists to add other users to a group so that they may have access to the the channels which are in the group.

/removeUserFromGroup :
This route is the polar opposite from /addToGroup. It takes the same two parameters as it, that being the user that you would like to remove and the name of the current group. It is then sent to the server where the server will find match the name of the user with there user data and then remove the group specified from there array of groups before saving the data object back into the database. This command is only accessible by group or super admins. This route exists to remove a user from a group so that they can no longer access the channels in the group.

/register :
This route is used when wanting to register a new user to the system. It accepts a username and a email as parameters. Once sent to the server the server will then generate a new user data object with the username and email provided, and then assign the user base level permissions and the default group that all users can access ‘global’. Before returning back to the client the new users data to confirm they were created and it is then added to the other user objects in the users collection in the database. This route exists to create a new entry in the users collection that will allow a user to sign in to the chat page with the new user data.

/removeUser :
This route is the opposite of /register, it takes a single parameter, which is the name of the user that you wish to remove. Once sent to the server, the server will then search for that users data in the users collection and then remove the specified users data once it has found a match. The server will then return back true to the client once the user has been erased from the system. This route exists to remove an entry in the users collection so that a specific set of credentials can no longer be used to log in to the chat page.

/setGroupAdmin :
This route accepts a username and a group name, which is always the current group that the user is in. These are sent to the server, which will then retrieve both the user data of the user specified and the group info of the group specified. It will then change the users permissions to group admin if they are not already one, or if they are not already a super admin. It will then append the users name to the list of admins in the group’s data, before saving both the group data and user data back to their respective collections. The server will then return true if it succeeded in promoting the user to group admin of the specified group. This route exists to promote a users level or privilege and allows them to carry out Group Admin level commands on the group they are defined to be an admin of.

/setAdmin :
This route is similar to /setGroupAdmin although it instead takes one parameter, that being a username. Once received by the server it will then find the specified users data in the users collection where the user data is stored, and pull out that users data. It will then change that users permission to super admin before putting it back into the collection and then return true to the client to inform them it was a success. This route promotes a user to a super admin which then allows them to carry out Super Admin level commands.

/removeGroup :
This route takes one parameter as the name of a group. The group name is sent to the server where it is then used to find the data for the specified group and then remove it from the database. It will then go on to pull all the user data stored in the users collection and proceed to remove the group from any user that was a part of that group. It will then return true to the client if the group was successfully removed. This route exists to remove an entry from the groups collection and then remove the channels that exist in that group so that no user can access the channels in that group any more.

/removeChannel :
This route takes a group name and a channel name. Once sent to the server, it will then pull the specified groups data from the groups collection in the database. It will then go through the group’s channels array and then remove the channel that was specified by the user from the group’s list of channels. The group’s data is then saved back to the collection before the server returns true to the client to let them know that the channel was removed successfully. This route exists to remove a single channel in a group so that it can no longer be connected to by any user that is apart of the group that channel was in.

/getChatHistory :
This route takes channel name and sends it to the server. It will then pass the channel name to the database collection that contains all of chat histories for all of the rooms. It will then go on to retrieve the chat history from the database and then return an array of all of the chat messages that have been sent in the channel back to the user, which is then displayed to the user so that they can see the messages sent to that channel. This route exists to retrieve the chat history of the channel the user is connecting to so that they can see the past messages that have been sent in the chat.

/uploadFile :
This route takes the name of a user and also an image in the form of a base64 URL. It then sends the username and the image on and finds the user that was specified's data and then proceeds to add the image to the users information and then save it back to the users collection in the database. This route exists to update the avatar of the user.



Angular Components, services, models and routes:
For this application there are two components that are being used. The first is the login component, which is what is presented to the user when they first access the site. The user must go through the login page to access any other component. The login component contains very simple HTML that just presents the user with a text box to write there username into and then a submit button. The typescript file associated with his component contains a call to the server route /auth, which allows the page to identify if there username that was entered by the user matches any of the user names in the servers files. The second component is the chat page component, which contains a majority of the functionality of the site. When the component is loaded it will quickly check if there is any user data stored in the clients session storage and allow them through if there is, or send them back to the login page if there is not. The HTML for this component contains 3 main areas. The first is the permissions area, where the various admin commands that exist depending on there users level of permissions exist. This works by an ngIf method that determines what the users level of permissions is and then displays different admin commands depending on their level of permissions. The second part of it is the channels and groups part, which contains two ngFor methods that create a new button for each channel or group, in the groups or channels array that is stored in the TS file. And then the third part is the chat part, which does function partly although it does not need to at this time.

As for services being used in this application, there are quite a few. With the most notable ones being the angular Routing service, Forms module, the Socket.io service and also the Jquery library. The forms module was used exclusively in the login page, and everything else mentioned was used primarily in the chat page. The angular routing system was used to navigate between the login and chat components with 3 routes being used. /login, which would take the user to the login page, /chat which would send the user to the chat page, and then also /** which would return the user to the login page as well. Socket.io was used for the small amount of chat functionality that exists in the current application, but the most part is mostly unused in the application. The Jquery library was used in place of the normal http library as I felt more comfortable with it in general and understood the use of it a bit better. This library was used in the communications between the server primarily via post requests made to the server, with the various routes mentioned above in the ‘List of routes’ section.
