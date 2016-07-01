
    ██████╗  █████╗ ████████╗██╗  ██╗██████╗ ██████╗  █████╗ ██╗    ██╗███████╗██████╗ 
    ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔══██╗██╔══██╗██╔══██╗██║    ██║██╔════╝██╔══██╗
    ██████╔╝███████║   ██║   ███████║██║  ██║██████╔╝███████║██║ █╗ ██║█████╗  ██████╔╝
    ██╔═══╝ ██╔══██║   ██║   ██╔══██║██║  ██║██╔══██╗██╔══██║██║███╗██║██╔══╝  ██╔══██╗
    ██║     ██║  ██║   ██║   ██║  ██║██████╔╝██║  ██║██║  ██║╚███╔███╔╝███████╗██║  ██║
    ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝


This is a demo for the PathDrawer library. This library is responsible for keeping and recycling DirectionsRenderer objects from Google. 

The problem with routes is that everytime you draw one, you have to create a DirectionsRenderer object. This causes unecessary stress in the system as everytime you need to show something to the user, you have to re-create everything from scratch. 
 
PathDrawer aleviates that necessity, by tracking and recycling those objects for you! Recycling is done via caching and prunning. PathDrawer offers you three levels of prunning, NO_PRUNNING, MODERATE_PRUNNING, and AGGRESSIVE_PRUNNING, make sure do read the documentation to know which one to use!

Furhermore, it also calculates  automatically the shortest, fastes and best routes as well, and you can even customize how the paths look!

This mini project contains the following libraries:

 - PrivateNameSpace.js: Functional requirement for all the libraries in this project.
 - MarkerTracker.js: Library to help you associate information to, and track markers.
 - MarkerLabelLib.js: Library responsible for managing marker labels. 
 - PathDrawer.js: Library that recycles DirectionsRenderer objects to promote speed.

All the libraries are documented, you can see example.js for a live map in action using these libraries in real time. 
To run the project simply open the index.html file. No additional setup is required.

By:     Pedro Miguel Pereira Serrano Martins
Date:   1 Jully, 2016