$(document).ready(function(){
  $("#assessment").submit(function(){     
    // Prevent form from being submitted normally
    event.preventDefault();
    
    // Grab the data from the form
    var $form = $( this ),
    q1 = $form.find("input[name=q0]:checked").val(),
    q2 = $form.find("input[name=q1]:checked").val(),
    q3 = $form.find("input[name=q2]:checked").val(),
    q4 = $form.find("input[name=q3]:checked").val(),
    q5 = $form.find("input[name=q4]:checked").val(),
    q6 = $form.find("input[name=q5]:checked").val(),
    q7 = $form.find("input[name=q6]:checked").val(),
    q8 = $form.find("input[name=q7]:checked").val(),
    q9 = $form.find("input[name=q8]:checked").val(),
    q10 = $form.find("input[name=q9]:checked").val(),
    q11 = $form.find("input[name=q10]:checked").val(),
    q12 = $form.find("input[name=q11]:checked").val(),
    q13 = $form.find("input[name=q12]:checked").val(),
    q14 = $form.find("input[name=q13]:checked").val(),
    q15 = $form.find("input[name=q14]:checked").val(),
    q16 = $form.find("input[name=q15]:checked").val(),
    q17 = $form.find("input[name=q16]:checked").val(),
    // Grab the action attribute from the form so you can send it in the post
    url = $form.attr( "action" );
      
    // Check if user has answered all the questions for the initial assessment
    if (typeof q1 == 'undefined' ||
        typeof q2 == 'undefined' ||
        typeof q3 == 'undefined' ||
        typeof q4 == 'undefined' ||
        typeof q5 == 'undefined' ||
        typeof q6 == 'undefined' ||
        typeof q7 == 'undefined' ||
        typeof q8 == 'undefined' ||
        typeof q9 == 'undefined' ||
        typeof q10 == 'undefined' ||
        typeof q11 == 'undefined' ||
        typeof q12 == 'undefined' ||
        typeof q13 == 'undefined' ||
        typeof q14 == 'undefined' ||
        typeof q15 == 'undefined' ||
        typeof q16 == 'undefined' ||
        typeof q17 == 'undefined') {
      alert("Answer all assessment questions before clicking submit.");
    }
    else {
      // Create variables to hold secondary assessmentIDs 
      // I wanted to use an array, but got too many errors and was running out of time 
      var domain1;
      var domain2;
      var domain3;
      var domain4;
      var domain5;
      var domain6;
      var domain7;
      var domain8;
      var domain9;

      // Check questions to see if they need to take secondary assessments
      // For all domains except Suicide Ideation, check if answer is greater than 1
      // For Suicide Ideation, check if answer is greater than 0
      // If any question in domain is greater than values listed above, push assessmentID into array

      // Domain 1: Depression
      if (q1 > 1 || q2 > 1)
         domain1 = true;
      else
         domain1 = false;
    
      // Domain 2: Anger
      if (q3 > 1)
         domain2 = true;
      else
         domain2 = false;
    
      // Domain 3: Mania
      if (q4 > 1 || q5 > 1)
         domain3 = true;
      else
         domain3 = false;
    
      // Domain 4: Anxiety
      if (q6 > 1 || q7 > 1 || q8 > 1)
         domain4 = true;
      else
         domain4 = false;
    
      // Domain 5: Somatic Symptoms
      if (q9 > 1 || q10 > 1)
         domain5 = true;
      else
         domain5 = false;
    
      // Domain 6: Suicide Ideation
      if (q11 > 0)
         domain6 = true;
      else
         domain6 = false;
    
      // Domain 7: Sleep Problems
      if (q12 > 1)
         domain7 = true;
      else
         domain7 = false;
    
      // Domain 8: Repetitive Thoughts and Behavior
      if (q13 > 1 || q14 > 1)
         domain8 = true;
      else
         domain8 = false;
    
      // Domain 9: Substance Abuse
      if (q15 > 1 || q16 > 1 || q17 > 1)
         domain9 = true;
      else
         domain9 = false;
    
      // Send post data
      var posting = $.post( url, { domain1: domain1,
                                   domain2: domain2,
                                   domain3: domain3,
                                   domain4: domain4,
                                   domain5: domain5,
                                   domain6: domain6,
                                   domain7: domain7,
                                   domain8: domain8,
                                   domain9: domain9 } );
      // Pause to give server time to create session variable
      setTimeout(
        function() 
        {
          // Change browser window to secondAssessment.jade
          window.location.assign('/secondAssessment');
        }, 250);
    }
  });
});
