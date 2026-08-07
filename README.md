# DidRen Analyzer Project
Designed for HELHa's CeREF Technique DidRen project. (Based in Belgium)

This project takes in all the DidRen applications and allows the user to test and analyze data within these applications

Requires test to be done with a registered DidRen app on a headset (for example, Meta Quest 3). This README file will only investigate the features of the web application. 

## Structure of Project
Upon login (or creation of account), the user is directed to a dashboard with two options: to test or to analyze. These are the two main functions of the website. 

### Testing
The user is allowed to connect to any valid headset that has the connection system set up. Once this happens, they can access all sessions associated with that headset. ON the webapp they will be asked for a code and allowed to name the headset they're connecting to. Upon successful connection, they should have access to all of that headset's information about the DidRen application

A signaling-server sets up the web socket server for future use. On activation of the web socket server, the applications are able to connect to the website in real time and display the live camera and information of the current test. The actual functions of this have not been implemented yet, but the web-socket server is ready to be activated and ready to operate. 


### Analyzing
All data from uses of the application is sent to the Supabase. The Supabase then houses all information for the webapp to access and display.
This is the primary component for the Analyzing page. 

The user is allowed to filter and select the sessions they have access to (depending on what headsets are registered under their user account). These filters can depend on patient or test configuration parameters. The users may pick multiple sessions to display on the graph.

Once the sessions are submitted to the analyzing page, the graph depicts all points of all selected sessions along a given telemetric aspect (velociy, position, acceleration, etc.). The user is allowed to average all of the sessions by clicking a button. Alongside the graph, a summary of overall statistics including maximums, minimums, and means are displayed on the right. 

## Materials Needed to Implement and Examine Edits of this Project
- A device with a version of the DidRen application installed (DidRen AR so far is the only one connected to the Supabase)
- Access to the Supabase, its API keys and proper permissions. Recognize its functions used in both the application and the web application
- This website and its features. 

