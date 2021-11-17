$(document).ready(function(){
  $("#secondAssessment").submit(function(){ 
    // Prevent form from being submitted normally
    event.preventDefault();

    // Grab the data from the form
    // Need to update this
    var $form = $( this ),
    url = $form.attr( "action" );

    // Check if all questions have been answered
    // If all questions are not answered 
      // Tell user to answer all questions to continue
    // else
      // For each domain
      // Create an array to hold values from form associated with that domain
      // Find values in form and push into array
      // Check if all questions have been answered
      // Calculate sum of values
      // Calculate average of values
      // Push average into array to hold averages

    // Code below checks if all questions have been answered
    // I quoted the following code from this URL: https://forum.jquery.com/topic/check-if-al-radio-buttons-are-checked
    var names = {};
    $('input:radio').each(function() { // find unique names
      names[$(this).attr('name')] = true;
    });

    var count = 0;
    $.each(names, function() { // then count them
      count++;
    });

    if($('input:radio:checked').length != count) {
      alert("All assessment questions must be answered before you can continue.");
    } 
    // End quoted code
    // If all questions are answered
    else { 
      // Domain 1: Depression
      var domain1Array = [];
      $('input[name^="a2"]:checked').each(function() {
        domain1Array.push($(this).val());
      });

      // Domain 2: Anger
      var domain2Array = [];
      $('input[name^="a3"]:checked').each(function() {
        domain2Array.push($(this).val());
      });

      // Domain 3: Mania
      var domain3Array = [];
      $('input[name^="a4"]:checked').each(function() {
        domain3Array.push($(this).val());
      });

      // Domain 4: Anxiety
      // Subtract 1 from each value to be inline with 0-4 point scale
      var domain4Array = [];
      $('input[name^="a5"]:checked').each(function() {
        domain4Array.push($(this).val() - 1);
      });

      // Domain 5: Somatic Symptoms
      var domain5Array = [];
      // Multiply each value by 2 to be inline with 0-4 point scale
      $('input[name^="a6"]:checked').each(function() {
        domain5Array.push($(this).val() * 2);
      });

      // Domain 6: Suicide Ideation
      // Multiply each value by 4/3 to be inline with 0-4 point scale
      var domain6Array = [];
      $('input[name^="a7"]:checked').each(function() {
        var value = parseFloat($(this).val()) * parseFloat(4/3);
        domain6Array.push(value);
      });

      // Domain 7: Sleep Problems
      // Subtract 1 from each value to be inline with 0-4 point scale
      var domain7Array = [];
      $('input[name^="a8"]:checked').each(function() {
        domain7Array.push($(this).val() - 1);
      });

      // Domain 8: Repetitive Thoughts and Behaviors
      var domain8Array = [];
      $('input[name^="a9"]:checked').each(function() {
        domain8Array.push($(this).val());
      });
    
      // Domain 9: Substance Abuse
      var domain9Array = [];
      $('input[name^="a10"]:checked').each(function() {
        domain9Array.push($(this).val());
      });

      // If all questions have been answered, go ahead and process answers
      // Array to hold averages from each assessment
      var averageArray = [];

      domain1 = 0;
      if (domain1Array.length > 0) {
        var sum = domain1Array.reduce(function(a, b) {
          return parseInt(a) + parseInt(b);
        }, 0)
        domain1 = ( sum / domain1Array.length );
      }
      averageArray.push(domain1);

      domain2 = 0;
      if (domain2Array.length > 0) {
        var sum = domain2Array.reduce(function(a, b) {
          return parseInt(a) + parseInt(b);
        }, 0)
        domain2 = ( sum / domain2Array.length );
      }
      averageArray.push(domain2);

      domain3 = 0;
      if (domain3Array.length > 0) {
        var sum = domain3Array.reduce(function(a, b) {
          return parseInt(a) + parseInt(b);
        }, 0)
        domain3 = ( sum / domain3Array.length );
      }
      averageArray.push(domain3);

      domain4 = 0;
      if (domain4Array.length > 0) {
        var sum = domain4Array.reduce(function(a, b) {
          return parseInt(a) + parseInt(b);
        }, 0)
        domain4 = ( sum / domain4Array.length );
      }
      averageArray.push(domain4);

      domain5 = 0;
      if (domain5Array.length > 0) {
        var sum = domain5Array.reduce(function(a, b) {
          return parseInt(a) + parseInt(b);
        }, 0)
        domain5 = ( sum / domain5Array.length );
      }
      averageArray.push(domain5);

      domain6 = 0;
      if (domain6Array.length > 0) {
        var sum = domain6Array.reduce(function(a, b) {
          return parseFloat(a) + parseFloat(b);
        }, 0)
        domain6 = ( sum / domain6Array.length );
      }
      averageArray.push(domain6);

      domain7 = 0;
      if (domain7Array.length > 0) {
        var sum = domain7Array.reduce(function(a, b) {
          return parseInt(a) + parseInt(b);
        }, 0)
        domain7 = ( sum / domain7Array.length );
      }
      averageArray.push(domain7);

      domain8 = 0;
      if (domain8Array.length > 0) {
        var sum = domain8Array.reduce(function(a, b) {
          return parseInt(a) + parseInt(b);
        }, 0)
        domain8 = ( sum / domain8Array.length );
      }
      averageArray.push(domain8);

      domain9 = 0;
      if (domain9Array.length > 0) {
        var sum = domain9Array.reduce(function(a, b) {
          return parseInt(a) + parseInt(b);
          }, 0)
        domain9 = ( sum / domain9Array.length );
      }
      averageArray.push(domain9);

      // Default group to be placed in is group 1 (i.e., user does not suffer from issues in any domain)
      // Determine which domain the user scored the highest on (this will have to change in the future)
      var groupPlacement = 1;
      var average = 0;
      var index = 0;
      for (i = 0; i < averageArray.length; i++) {
        if (average < averageArray[i]) {
          average = averageArray[i];
          index = i;
        }
      }
    
      // Set groupPlacement variable to reflect chosen domain
      if (average >= 1.5) {
        groupPlacement = parseInt(groupPlacement) + parseInt(index) + 1;
      }

      // For now, this sends an arbitrary domain number (in this case, 1)
      // to groupPlacement.js and updates the user table in the User database
      var posting = $.post( url, { result: groupPlacement } );

      setTimeout(
        function() 
        {
          // Change browser window to secondAssessment.jade
          window.location.assign('/groupPlacement');
        }, 250);
    }
  });
});
