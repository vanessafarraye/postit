$(function () {
	//alert("Hello")
	View.currentUser();


	
});

function View() {};

View.render = function(user, parentId, templateId) {
	var template = _.template($("#" + templateId).html());
  	$("#" + parentId).html(template({templateUser: user}));	
};

View.currentUser = function() {
  $.get("/currentUser", function (user) {
	console.log(user);
	View.render(user, "pic-ul", "pic-template");
  });	
};

// client side has to send a delete request to the backend
View.delete = function(picture) {
	console.log("hello", picture);
	var picId = $(picture).data().id;
	console.log(picId);
		$.ajax({
			url: '/pictures/' + picId,
			type: 'DELETE',
			success: function(res) {
				console.log("deleted successfuly")
			}
		}).done(function() {
			console.log('response ok. re-rendering..');
			View.currentUser();	
	    });
};
