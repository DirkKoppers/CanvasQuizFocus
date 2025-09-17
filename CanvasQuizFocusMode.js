document.addEventListener('DOMContentLoaded', () => {

  // Show the main alert box only once per quiz session.	
  const show_alert_once = true;
	
  const ENV = window.ENV || {};
  const currentUserIsStudent = ENV.current_user_is_student;
  const currentUserDisplay = ENV.current_user.display_name;
  const currentUserRoles = ENV.current_user_roles || [];
  const normalizedRoute = ENV.SENTRY_FRONTEND?.normalized_route || '';
  
  // Check if user is student or "View as Student"
  if (currentUserIsStudent || currentUserRoles.includes('fake_student')) {
    let newQuizFound = false;

    if (normalizedRoute === "/courses/{course_id}/assignments/{id}") {
      // Detect new quiz via LTI launch, not 100% if this is correct, needs further testing/confirmation
      const newQuizLaunchPattern = /quiz-lti-iad-prod\.instructure\.com\/lti\/launch/;
      Array.from(document.forms).forEach(form => {
        if (newQuizLaunchPattern.test(form.action)) {
          newQuizFound = true;
        }
      });
    }

    if (normalizedRoute === "/courses/{course_id}/quizzes/{quiz_id}/take" || newQuizFound) {
      // Create alert container and message
      const newAlert = document.createElement('div');
      newAlert.innerHTML = `
        <div id="stayfocused" style="display:none; padding: 50px; background: #ffdddd; border: 1px solid #ff0000; z-index: 9999; position: fixed; top: 10%; left: 50%; transform: translateX(-50%); max-width: 400px;">
          <p>Hi ` + currentUserDisplay + `,<br><br>We would like you to stay focused on this quiz/assignment. There are a lot of good reasons one might wonder of from this page:
		  <p><ul><li>Research</li><li>Screen Reader</li><li>Email mom</li></ul></p>Just don't do it for cheating, seriously!<br><br>When you are ready to continue <button id="iamfocused">Click Me!</button>
		  <span id="show_once" style="display:none;"><br><br>(This reminder won't show up again for this quiz session)</span></p>
        </div>`;

	  const classicContent = document.getElementById('right-side');	
      const quizContent = document.getElementById('content');
      if (!quizContent) {
        console.warn("Cannot find quiz content container (#content)");
        return;
      }
      quizContent.parentNode.insertBefore(newAlert, quizContent);
      const stayFocusedDiv = document.getElementById('stayfocused');
	  
	  if (show_alert_once) {
		  document.getElementById('show_once').style.display = "block";	
	  }
	  
      // Create notice container and message
      const newNotice = document.createElement('div');
      newNotice.innerHTML = '<div id="staynoticed" style="z-index: 9999; top: 15px; right: 15px; position: fixed; display: none; padding: 7px; background: #ffdddd; border: 1px solid #ff0000;">stay focused</div>';
	
      const crumbs_right = document.getElementsByClassName('right-of-crumbs');
      if (!crumbs_right) {
        console.warn("Cannot find crumbs content container (#right-of-crumbs)");
//        return;
      }
	  
	  crumbs_right[0].parentNode.insertBefore(newNotice, crumbs_right[0]);		
	  const stayNoticedDiv = document.getElementById('staynoticed');			
		
      let focusAlert = false;
	  let focusNotice = false;

	  // Removes the container and message when button is pressed.
      document.getElementById("iamfocused").onclick = () => {
        focusAlert = false;
		if (show_alert_once) {
			focusNotice = true;
		}
        stayFocusedDiv.style.display = "none";
        quizContent.style.visibility = "visible";
		if (classicContent) {
		  classicContent.style.visibility = "visible";
		}		
      };

      // Listen for mouse leaving the document area
      document.addEventListener('mouseleave', () => {
		if (focusNotice) {
			stayNoticedDiv.style.display = "block";
		}
        else if (!focusAlert) {
          focusAlert = true;
          stayFocusedDiv.style.display = "block";
          quizContent.style.visibility = "hidden";
		  if (classicContent) {
			classicContent.style.visibility = "hidden";
		  }
        }
      });
	  
	  // Listen for mouse entering the document area
      document.addEventListener('mouseenter', () => {
		if (focusNotice) {
			stayNoticedDiv.style.display = "none";
		}
      });	  
	  
    }
  }
});
