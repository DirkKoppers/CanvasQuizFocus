document.addEventListener('DOMContentLoaded', () => {

  // Show the main alert box only once per quiz session. It will revert to a smaller "stay focused" notice box so that valid browser
  // tools and extentions can be used. Set to "false" to always show the main alert when a user leaves the content area.	
  const show_alert_once = true;

  // Show the "stay focus" notice box at the location where the mouse leaves the screen. Set to "false" to have it appear in the top-right corner.
  // If "show_alert_once" is set to "false", the notice box will not show up at all since the alert box will show up instead.
  const show_notice_at_mouse_location = true;
	
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
        <div id="stayfocused" style="display:none; padding: 50px; background: #ffdddd; border: 1px solid #ff0000; z-index: 9999999; position: fixed; top: 10%; left: 50%; transform: translateX(-50%); max-width: 400px;">
          <p>Hi ${currentUserDisplay},<br><br>We would like you to stay focused on this quiz. There are good reasons one might leave this page. If you need to use an external tool or browser extension to complete this quiz, 
		  please check in with your institution to see if it is approved.<br><br>When you are ready to continue <button id="iamfocused">Click Me!</button>
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
	  const stayNoticedOffset = 15;
      newNotice.innerHTML = `<div id="staynoticed" style="z-index: 9999999; top: ${stayNoticedOffset}px; right: ${stayNoticedOffset}px; position: fixed; visibility: hidden; padding: 7px; background: #ffdddd; border: 1px solid #ff0000;">stay focused</div>`;
	
      const crumbs_right = document.getElementsByClassName('right-of-crumbs');
      if (!crumbs_right) {
        console.warn("Cannot find crumbs content container (#right-of-crumbs)");
//        return;
      }
	  
	  crumbs_right[0].parentNode.insertBefore(newNotice, crumbs_right[0]);		
	  const stayNoticedDiv = document.getElementById('staynoticed');			
		
      let focusAlert = false;
	  let focusNotice = false;
	  const stayNoticedDivwidth = stayNoticedDiv.offsetWidth;
	  const stayNoticedDivheight = stayNoticedDiv.offsetHeight;
	  const stayNoticedhYcalc = (stayNoticedDivheight/2) + stayNoticedOffset;
	  const stayNoticedXcalc = (stayNoticedDivwidth/2) + stayNoticedOffset;

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
      document.addEventListener('mouseleave', function(event) {
		if (focusNotice) {
			if (show_notice_at_mouse_location) {
				let mouseX = event.clientX;
				let mouseY = event.clientY;
				let docX = document.documentElement.clientWidth;
				let docY = document.documentElement.clientHeight;
				stayNoticedDiv.style.top = '';
				stayNoticedDiv.style.right = '';
				stayNoticedDiv.style.bottom = '';
				stayNoticedDiv.style.left = '';
				if (mouseX <= 0) {
					stayNoticedDiv.style.left = `${stayNoticedOffset}px`;
				}
				else if (mouseX >= docX) {
					stayNoticedDiv.style.right = `${stayNoticedOffset}px`;
				}
				else if (mouseY <= 0) {
					stayNoticedDiv.style.top = `${stayNoticedOffset}px`;
				}
				else if (mouseY >= docY) {
					stayNoticedDiv.style.bottom = `${stayNoticedOffset}px`;
				}
				else {
					stayNoticedDiv.style.top = '15px';
					stayNoticedDiv.style.right = '15px';	
				}
				if (stayNoticedDiv.style.left || stayNoticedDiv.style.right) {
					if (mouseY <= stayNoticedhYcalc) {
						stayNoticedDiv.style.top = `${stayNoticedOffset}px`;
					}
					else if (mouseY >= (docY - stayNoticedhYcalc)) {
						stayNoticedDiv.style.bottom = `${stayNoticedOffset}px`;
					}
					else {
						stayNoticedDiv.style.top = mouseY - (stayNoticedDivheight/2) + 'px';
					}				
				}
				else if (stayNoticedDiv.style.top || stayNoticedDiv.style.bottom) {
					if (mouseX <= stayNoticedXcalc) {
						stayNoticedDiv.style.left = `${stayNoticedOffset}px`;
					}
					else if (mouseX >= (docX - stayNoticedXcalc)) {
						stayNoticedDiv.style.right = `${stayNoticedOffset}px`;
					}
					else {
						stayNoticedDiv.style.left = mouseX - (stayNoticedDivwidth/2) + 'px';
					}				
				}
			}
			stayNoticedDiv.style.visibility = "visible";

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
			stayNoticedDiv.style.visibility = "hidden";
		}
      });	  
	  
    }
  }
});
