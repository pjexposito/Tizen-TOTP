function ReadError(next){
  var keyItems=[];

  var keyItem = {};
  keyItem.service = "EXAMPLE";
  keyItem.id = "";
  keyItem.key = "JBSWY3DPEHPK3PXP";
  keyItems.push(keyItem);

  keyItem = {};
  keyItem.service = "EXAMPLE";
  keyItem.id = "";
  keyItem.key = "OFKLYERJNLGOIPTA";
  keyItems.push(keyItem);

  keyItems.example = true;
  next(keyItems);
}

function moveAuthFile(folders, srcnames, next ){
	var folder = folders.pop();
	var srcname = srcnames.pop();
	tizen.filesystem.resolve(folder + "/" + srcname,
			function(file){
				tizen.filesystem.resolve(folder,
						function(path) {
							path.moveTo(file.fullPath, "documents/auth_keyinfo.txt", true, next, next);
						},
						next,
						"rw");
			},
			function(){
				if(folders.length>0){
					moveAuthFile(folders,srcnames, next);
				} else {
					next();
				}
			});
}

function ReadItems(next){
	moveAuthFile(
			["downloads","music"],
			["auth_keyinfo.txt","auth_keyinfo.mp3"],
		function() {
		  tizen.filesystem.resolve(
			      "documents/auth_keyinfo.txt", function(file) {
			        file.readAsText(function(data) {
			          var keyItems=[];
			          var keys = data.split(/\r\n|\r|\n/);
			          for(var i=0;i<keys.length;i++){
			            var key = keys[i];
			            var splited = key.split(":");
			            if(splited.length === 3){
			              var keyItem = {};
			              keyItem.service = splited[0];
			              keyItem.id = splited[1];
			              keyItem.key = splited[2];
			              keyItems.push(keyItem);
			            }
			          }
			          next(keyItems);
			        }, function() {ReadError(next);});
			      }, function() { ReadError(next);});
		}
	);
}


