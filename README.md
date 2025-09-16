# CanvasQuizFocus
Remind students to stay focused when taking a Canvas quiz

“Focus Mode” Proof of concept.

 - Uses Javascript “mouseleave” event to detect a user leaving the page.
 - Only enabled for enrolled students and “View as Student” mode.
 - Only enabled on quiz pages (New and Classic).
 - Can be installed globally or per subaccount through Canvas Theme Editor: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-upload-custom-JavaScript-and-CSS-files-to-an-account/ta-p/253. Be careful not to overwrite existing javascript files but instead append to them.
 - The alert box only shows up once per quiz section, followed by an unobstructive “Stay Focused" message when the user leaves the content window.
