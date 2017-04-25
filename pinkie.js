(function(global){
	var Pinkie = function(func){

	  var deferred = [];

	  var resolve = function(data){
	    do {
	      var funcToExecute = deferred.shift();
	    } while (funcToExecute && funcToExecute.type != "then" );

	    if (funcToExecute){
	      var ret = funcToExecute.func(data);
	      if (ret instanceof Pinkie){
	        ret.then(function(data){
	          resolve(data);
	        })
	        .catch(function(error){
	          reject(error);
	        })
	      } else {
	        resolve(ret);
	      }
	    }
	  };

	  var reject = function(error){
	    do {
	      var funcToExecute = deferred.shift();
	    } while (funcToExecute && funcToExecute.type != "catch" );
	    
	    if (funcToExecute){
	      var ret = funcToExecute.func(error);
	      if (ret instanceof Pinkie){
	        ret.then(function(data){
	          resolve(data);
	        })
	        .catch(function(error){
	          reject(error);
	        })
	      } else {
	        resolve(ret);
	      }
	    }
	  };
  
	  this.catch = function(f){
	    deferred.push({
	      "type" : "catch",
	      "func" : f
	    });
	    return this;
	  };

	  this.then = function(f){
	    deferred.push({
	      "type" : "then",
	      "func" : f
	    });
	    return this;
	  };

	  setTimeout(function(){
	    func(resolve,reject);
	  },0);
  	return this;
	};

	Pinkie.race = function(promises){
	  var p = new Pinkie(function(resolve,reject){
	    var resolved = false;
	    for (var i=0;i<promises.length;i++){
	      promises[i].then(function(d){
	        if (!resolved){
	          resolved = true;
	          resolve(d);
	        }
	      }).catch(function(e){
	        if (!resolved){
	          resolved = true;
	          reject(e);
	        }
	      });
	    }
	  });
	  return p;
	};


	Pinkie.all = function(promises){
	  var resolvedCount = 0;
	  var returnArray = [];
	  var error = false;
	   var p = new Pinkie(function(resolve,reject){
	    promises.forEach(function(promise,i){
	        promise.then(function(d){
	        if (!error){
	          resolvedCount++;
	          returnArray[i] = d;
	          if (resolvedCount === promises.length){
	            resolve(returnArray);
	          }
	          
	        }
	      }).catch(function(e){
	        if (!error){
	          error = true;
	          reject(e);
	        }
	      });
	    });
	    
	  });
	  return p;
	};
	global.Pinkie = Pinkie;
})(this);


