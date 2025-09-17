document.addEventListener('DOMContentLoaded', () => {

  // Show the main alert box only once per quiz session. It will revert to a smaller "stay focused" notice box so that valid browser
  // tools and extentions can be used. Set to "false" to always show the main alert when a user leaves the content area.	
  const showAlertOnce = true;

  // Show the "stay focus" notice box at the location where the mouse leaves the screen. Set to "false" to have it appear in the top-right corner.
  // If "showAlertOnce" is set to "false", the notice box will not show up at all since the alert box will show up instead.
  const showNoticeAtMouseLocation = true;


  const ENV = window.ENV || {};
  const currentUserIsStudent = ENV.current_user_is_student;
  const currentUserDisplay = ENV.current_user?.display_name || 'Student';
  const currentUserRoles = ENV.current_user_roles || [];
  const normalizedRoute = ENV.SENTRY_FRONTEND?.normalized_route || '';

  // Only proceed if current user is student or viewing as student
  if (!(currentUserIsStudent || currentUserRoles.includes('fake_student'))) {
    return;
  }

  // Determine if this is a new quiz launch via LTI form or quiz take route
  let newQuizFound = false;

  if (normalizedRoute === "/courses/{course_id}/assignments/{id}") {
    const newQuizLaunchPattern = /quiz-lti-iad-prod\.instructure\.com\/lti\/launch/;
    newQuizFound = Array.from(document.forms).some(form => newQuizLaunchPattern.test(form.action));
  }

  const isQuizTake = normalizedRoute === "/courses/{course_id}/quizzes/{quiz_id}/take";
  if (!isQuizTake && !newQuizFound) {
    return; // Nothing to do on non-quiz pages
  }

  // Cache elements
  const quizContent = document.getElementById('content');
  if (!quizContent) {
    console.warn("Cannot find quiz content container (#content)");
    return;
  }
  const classicContent = document.getElementById('right-side');

  // Create the main alert box
  const alertHTML = `
    <div id="stayfocused" style="
      display:none;
      padding: 50px;
      background: #ffdddd;
      border: 1px solid #ff0000;
      z-index: 9999999;
      position: fixed;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      max-width: 400px;
      box-sizing: border-box;
    ">
      <p>
        Hi ${currentUserDisplay},<br><br>
        We would like you to stay focused on this quiz. There are good reasons one might leave this page. 
        If you need to use an external tool or browser extension to complete this quiz, please check in with your institution to see if it is approved.<br><br>
        When you are ready to continue <button id="iamfocused">Click Me!</button>
        <span id="show_once" style="display:none;"><br><br>(This reminder won't show up again for this quiz session)</span>
      </p>
    </div>
  `;

  // Insert alert before quiz content
  const alertContainer = document.createElement('div');
  alertContainer.innerHTML = alertHTML;
  document.body.appendChild(alertContainer);

  const stayFocusedDiv = document.getElementById('stayfocused');
  const showOnceSpan = document.getElementById('show_once');
  if (showAlertOnce) {
    showOnceSpan.style.display = 'block';
  }

  // Create the small "stay focused" notice box
  const stayNoticedOffset = 15;
  const noticeHTML = `
    <div id="staynoticed" style="
      z-index: 9999999;
      position: fixed;
      top: ${stayNoticedOffset}px;
      right: ${stayNoticedOffset}px;
      visibility: hidden;
      padding: 7px;
      background: #ffdddd;
      border: 1px solid #ff0000;
      white-space: nowrap;
      user-select: none;
      cursor: default;
      box-sizing: border-box;
    ">
      stay focused
    </div>
  `;

  const noticeContainer = document.createElement('div');
  noticeContainer.innerHTML = noticeHTML;
  document.body.appendChild(noticeContainer);

  const stayNoticedDiv = document.getElementById('staynoticed');

  let alertVisible = true;
  let noticeVisible = false;

  // Cache dimensions once because notice is hidden initially
  const noticeWidth = stayNoticedDiv.offsetWidth;
  const noticeHeight = stayNoticedDiv.offsetHeight;
  const verticalThreshold = (noticeHeight / 2) + stayNoticedOffset;
  const horizontalThreshold = (noticeWidth / 2) + stayNoticedOffset;

  // Button handler to dismiss alert and show notice if configured
  const button = document.getElementById('iamfocused');
  button.addEventListener('click', () => {
    alertVisible = false;
    stayFocusedDiv.style.display = 'none';
    quizContent.style.visibility = 'visible';
    if (classicContent) classicContent.style.visibility = 'visible';

    if (showAlertOnce) {
      noticeVisible = true;
    }
  });

  // Position the notice based on mouse leaving the viewport
  function positionNotice(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const docWidth = document.documentElement.clientWidth;
    const docHeight = document.documentElement.clientHeight;

    // Reset styles
    stayNoticedDiv.style.top = '';
    stayNoticedDiv.style.right = '';
    stayNoticedDiv.style.bottom = '';
    stayNoticedDiv.style.left = '';

    // Position horizontally first
    if (mouseX <= 0) {
      stayNoticedDiv.style.left = `${stayNoticedOffset}px`;
    } else if (mouseX >= docWidth) {
      stayNoticedDiv.style.right = `${stayNoticedOffset}px`;
    }

    // Position vertically first
    if (mouseY <= 0) {
      stayNoticedDiv.style.top = `${stayNoticedOffset}px`;
    } else if (mouseY >= docHeight) {
      stayNoticedDiv.style.bottom = `${stayNoticedOffset}px`;
    }

    // If left or right fixed, adjust vertical position to follow mouse
    if (stayNoticedDiv.style.left || stayNoticedDiv.style.right) {
      if (mouseY <= verticalThreshold) {
        stayNoticedDiv.style.top = `${stayNoticedOffset}px`;
      } else if (mouseY >= (docHeight - verticalThreshold)) {
        stayNoticedDiv.style.bottom = `${stayNoticedOffset}px`;
      } else {
        stayNoticedDiv.style.top = `${mouseY - (noticeHeight / 2)}px`;
      }
    } 
    // If top or bottom fixed, adjust horizontal position to follow mouse
    else if (stayNoticedDiv.style.top || stayNoticedDiv.style.bottom) {
      if (mouseX <= horizontalThreshold) {
        stayNoticedDiv.style.left = `${stayNoticedOffset}px`;
      } else if (mouseX >= (docWidth - horizontalThreshold)) {
        stayNoticedDiv.style.right = `${stayNoticedOffset}px`;
      } else {
        stayNoticedDiv.style.left = `${mouseX - (noticeWidth / 2)}px`;
      }
    } 
    // Default to top-right corner if none set (should not happen)
    else {
      stayNoticedDiv.style.top = `${stayNoticedOffset}px`;
      stayNoticedDiv.style.right = `${stayNoticedOffset}px`;
    }
  }

  // Handle mouse leaving the document/window
  document.addEventListener('mouseleave', (event) => {
    // If the mouse actually leaves the window (check relatedTarget/toElement is null)
    if (!event.relatedTarget && !event.toElement) {
      if (noticeVisible) {
        if (showNoticeAtMouseLocation) {
          positionNotice(event);
        } else {
          stayNoticedDiv.style.top = `${stayNoticedOffset}px`;
          stayNoticedDiv.style.right = `${stayNoticedOffset}px`;
        }
        stayNoticedDiv.style.visibility = 'visible';
      } else if (alertVisible) {
        stayFocusedDiv.style.display = 'block';
        quizContent.style.visibility = 'hidden';
        if (classicContent) classicContent.style.visibility = 'hidden';
      }
    }
  });

  // Hide the notice when mouse re-enters the document
  document.addEventListener('mouseenter', () => {
    if (noticeVisible) {
      stayNoticedDiv.style.visibility = 'hidden';
    }
  });
});
