function main(adress=null){
	$("#main").load("/static/solveTSP.html");
	tsp_instances(adress);
}


function main_filtered(){
	var adress=$("#search_adress").val();
	main(adress);
}

function addTSP(){
	$("#main").load("/static/add_instance.html");
		
}

function addAppendix(){
	$("#main").load("/static/appendix.html");
		
}

function myTSP(){
		$("#main").load("/static/solveTSP.html",function(){
			$("#solndiv").addClass('hiddenY');
			$("#solnup").addClass('hiddenY');
		});
	var myAdress=getAccount();
		contractInstance.createdInstances.call(myAdress,addAll);	  

}

function addAll(error,result){
 	if (!error){
	 // var num_inst=result['c'][0];
	  for (var i=0;i<result.length;i++){
		contractTemp = web3.eth.contract(abi);
		var curr_add=result[i];
		contractInstanceTemp=contractTemp.at(curr_add);
	
		contractInstanceTemp.getMeta.call(function (error, result) {
			if(error){
				console.log(error);
				return;
			}else{
			var adress=result[0];
			var prize=result[4];
			var size=result[1];
			var ts=result[3];
			var curr_best=result[2];
			add_instance(adress,size,prize,ts,curr_best,result[5],getAccount()==result[6],result[7]);
			define_click();
			}
		})
	  }//for loop

	}//if
	else console.log(error);
}

function mySolvedTSP(){
		$("#main").load("/static/solveTSP.html",function(){
		});
	var myAdress=getAccount();
	contractInstance.solvedInstances.call(myAdress,addAll);	  

}


row_id=null;


function define_click(){
	$(document).ready(function(){
	$(".new-TSP").click(function() {
	row_id=$(this).attr('id');
	$('#check').removeClass('disabled');
	$('#claim').addClass('disabled');
	$('#solndiv').removeClass('hiddenX');
	$('#solnup').removeClass('disabled');

	$('#best').removeClass('disabled');
	$(this).addClass('table-active').siblings().removeClass('table-active');
	});

	$(".old-TSP").click(function() {
	row_id=$(this).attr('id');
	$('#check').removeClass('disabled');
	$('#claim').removeClass('disabled');
	$('#solndiv').addClass('hiddenX');
	$('#solnup').addClass('disabled');
	$('#best').removeClass('disabled');
	$(this).addClass('table-active').siblings().removeClass('table-active');
	});
	
	$(".closed-TSP").click(function() {
	row_id=$(this).attr('id');
	$('#check').removeClass('disabled');
	$('#claim').addClass('disabled');
	$('#solndiv').addClass('hiddenX');
	$('#solnup').addClass('disabled');
	$('#best').removeClass('disabled');
	$(this).addClass('table-active').siblings().removeClass('table-active');
	});

	});
}


function add_instance(adress, size,prize,ts,curr_best,closed,win,paid){
	var str="<tr class='table-row' id=\""+adress+"\">"+
		"<td>"+adress+"</td>"+
		"<td>"+size+"x"+size+"</td>"+
		"<td>"+curr_best+"</td>";
		if(prize<10**10)
		str+="<td>"+prize+" wei</td>";
		else str+="<td>"+prize/10**18+" Ether</td>";
		str+="<td>"+ts+"</td>"+
	    "</tr>";

	$("#table1").append(str);

	if(closed&&!paid){
		$("#"+adress).addClass('closed-TSP');
	}
	else if(closed){
		$("#"+adress).addClass('old-TSP');
	}else $("#"+adress).addClass('new-TSP');
	if(win) $("#"+adress).css("background-color", "LightGreen"); 

}


function getPrize(){

	if(row_id==null)return;
	contractTemp = web3.eth.contract(abi);
	contractInstanceTemp=contractTemp.at(row_id);	
	contractInstanceTemp.check_prizes.sendTransaction(function (error, result) {
		if(error)console.log(error);
		else console.log(result);
	});


}

function add_ts(){
	
	contractInstance.Time_call.call(function (error, result) {
	if(!error){
		$("#curr_ts").text("Current TimeStamp: "+result['c'][0]);
		$("#timestamp1").attr("value", result['c'][0]+1000);
	}
	});	
	setTimeout(add_ts, 5000);
}

function uploadSoln(){
	if(row_id==null)return;//maybe warn the user
	var file=$("#soln").prop('files')[0];
	var reader = new FileReader();
	reader.onload = function(event) {
	    var contents = reader.result;
	    var inst_arr = [];
			    var arr_=contents.split(' ')
	    for(var i=0;i<arr_.length;i++)
		if(!Number.isNaN(parseInt(arr_[i]))){
	         inst_arr.push(parseInt(arr_[i]));
		}
		
		contractInstance.uploadSolution.sendTransaction(row_id,inst_arr,function (error, hash) {
			if(error)console.log(error);
			else {
				$('#headersub').text("TRANSACTION PENDING");
				$('.btn').addClass("disabled");
				$('#soln').prop("disabled", true);
				TX_Status(hash,mySolvedTSP);
			}
		
		});
		};

	reader.onerror = function(event) {
	    console.error("File could not be read! Code " + event.target.error.code);
	};
	reader.readAsText(file);	

	   
	
}

function TX_Status(hash,callback){

	web3.eth.getTransaction(hash,function(err,res){
	if(!err){
	if(res['blockNumber']!=null){//transaction is not confirmed every time block number is not null but it is enough for now
					$('#headersub').text("TRANSACTION CONFIRMED");
					setTimeout(callback,15000);
	}else 	setTimeout(TX_Status(hash,callback), 1000);
	}
	
});



}


function submit_instance(){
	var file=$("#instance").prop('files')[0];


	var reader = new FileReader();
	reader.onload = function(event) {
	    var contents = reader.result;
	    var inst_arr = [];
	    var arr_=contents.split('\n')
		for(var i=0;i<arr_.length;i++){
		var arr2=arr_[i].split(' ');
		for(var j=0;j<arr2.length;j++)if(!Number.isNaN(parseInt(arr2[j])))
			inst_arr.push(parseInt(arr2[j]));			
		};
		var ts=parseInt($("#timestamp1").val());
		var wei=parseInt($("#prize").val());
		var size=parseInt(Math.sqrt(inst_arr.length));

		contractInstance.addTSP.sendTransaction(size,inst_arr,ts,
{value: wei},function (error, hash) {
			if(error)console.log(error);
			else {
				$('#headersub').text("TRANSACTION PENDING");
				$('#timestamp1').prop("disabled", true);
				$('#prize').prop("disabled", true);
				$('#instance').prop("disabled", true);

				TX_Status(hash,myTSP);
			}
		
		});
		};

	reader.onerror = function(event) {
	    console.error("File could not be read! Code " + event.target.error.code);
	};
	reader.readAsText(file);	



}


function set_user(){
	
	$("#user").text("User Address: "+getAccount());
	setTimeout(set_user, 5000);
}

function set_balance(eth){
	
	$("#balance").text("Balance: "+eth+ " ETH");
}

function tsp_instances(adress_=null) {
	contractInstance.numInstances.call(function (error, result) {
 	if (!error){
	  var num_inst=result['c'][0];
	  for (var i=0;i<num_inst;i++){
		contractInstance.getMeta.call(i,function (error, result) {
			if(error){
				console.log(error);
				return;
			}else{
			var adress=result[0];
			var prize=result[4];
			var size=result[1];
			var ts=result[3];
			var curr_best=result[2];
			if(adress_==null || adress_==adress)
			add_instance(adress,size,prize,ts,curr_best,result[5],getAccount()==result[6],result[7]);
			define_click();
			}
		})
	  }

	}
	else console.log(error);
	})	  

}

function downloadElem(text,fn){

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', fn);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);


}


function download_() {

	contractTemp = web3.eth.contract(abi);
		contractInstanceTemp=contractTemp.at(row_id);
		contractInstanceTemp.getCosts.call(function (error, result) {
			//do something with the result

			if(error)console.log(error);
			else {
				var str = "";
				var size=parseInt(Math.sqrt(result.length));
				for(var i=0;i<result.length;i++){
					str+=(result[i]['c'][0])+ " ";

					if(((i+1)%size)==0)
						str+="\n";
					}

				downloadElem(str,"instance");							
				
			}		
		});
		

}


function download_best() {

	contractTemp = web3.eth.contract(abi);
		contractInstanceTemp=contractTemp.at(row_id);
		contractInstanceTemp.currentBest.call(function (error, result) {
			//do something with the result

			if(error)console.log(error);
			else {
				var str = "";
				for(var i=0;i<result.length;i++){
					str+=(result[i]['c'][0])+ " ";

					}
				downloadElem(str,"best");							
				
			}		
		});
		

}



$(document).ready(function() {
	main();
	setTimeout(add_ts, 100);
	setTimeout(set_user, 100);
	setTimeout(getBalance, 100);	   
	
});

	


const getAccount = () => {
  // check if web3 present
  if (web3) {
    // return default account
    return web3.eth.accounts[0];

  }
  return undefined;
};


function getBalance(){


	web3.eth.getBalance(getAccount(),function (error, result) {
		if(!error){
			var eth=result/1000000000000000000;
			set_balance(eth);
		}
	});
	setTimeout(getBalance, 5000);
}








abi=[
	{
		"constant": true,
		"inputs": [],
		"name": "getCosts",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "Time_call",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "cost",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "currentBest",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "costs",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "check_prizes",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "readyToPay",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner_address",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "soln_",
				"type": "uint256[]"
			},
			{
				"name": "solver",
				"type": "address"
			}
		],
		"name": "uploadSolution",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "size",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getMeta",
		"outputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "bool"
			},
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "isClosed",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getPrize",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "soln",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getInstance",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "closing",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "size_",
				"type": "uint256"
			},
			{
				"name": "costs_",
				"type": "uint256[]"
			},
			{
				"name": "closing_",
				"type": "uint256"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "constructor"
	}
]

var abi_API=[
	{
		"constant": false,
		"inputs": [
			{
				"name": "size",
				"type": "uint256"
			},
			{
				"name": "costs_",
				"type": "uint256[]"
			},
			{
				"name": "closing_",
				"type": "uint256"
			}
		],
		"name": "addTSP",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "finalize",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "add",
				"type": "address"
			},
			{
				"name": "soln_",
				"type": "uint256[]"
			}
		],
		"name": "uploadSolution",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "add",
				"type": "address"
			}
		],
		"name": "createdInstances",
		"outputs": [
			{
				"name": "",
				"type": "address[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "creators",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getMeta",
		"outputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "bool"
			},
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "Instances",
		"outputs": [
			{
				"name": "",
				"type": "address[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "list",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "add",
				"type": "address"
			}
		],
		"name": "numCreatedInstance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "numInstances",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "reverse_map",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "add",
				"type": "address"
			}
		],
		"name": "solvedInstances",
		"outputs": [
			{
				"name": "",
				"type": "address[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "solvers",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "Time_call",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
contract = web3.eth.contract(abi_API);
//write contract adddress here
contractInstance=contract.at("0xe57c47569f3b6472085817bc5ec166ac9fdcad08");

