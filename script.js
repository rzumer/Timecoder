$(document).ready(function() {
    var max_fields      = 99; //maximum input boxes allowed
    var wrapper         = $("#wrapper"); //Fields wrapper
    var add_button      = $("#addField"); //Add button ID
	var submit_button	= $("#calculate"); //Calcualte button ID
   
    var x = 1; //initlal text box count
    $(add_button).click(function(e){ //on add input button click
        e.preventDefault();
        if(x < max_fields){ //max input box allowed
            x++; //text box increment
            $(wrapper).append('<div class="timecode"><input type="text" name="startFrame[]" placeholder="Start Frame"/> <input type="text" name="endFrame[]" placeholder="End Frame"/> <a class="removeField btn btn-danger btn-xs">Remove</a></div>');
        }
    });
   
    $(wrapper).on("click",".removeField", function(e){ //user click on remove text
        e.preventDefault(); $(this).parent('div').remove(); x--;
    })
	
	$(submit_button).click(function(e){
		e.preventDefault();
		
		var startcodes = [];
		var endcodes = [];
		
		var eflag = false;
		$('.timecode').each(function(){
			var start = $(this).find('input[name="startFrame[]"]').val();
			var end = $(this).find('input[name="endFrame[]"]').val();
			if(Math.floor(start) != start || !$.isNumeric(start) || Math.floor(end) != end || !$.isNumeric(end))
				eflag = true;
				
			startcodes.push(start);
			endcodes.push(end);
		});
		if(eflag) return alert('Frame numbers must be valid integers.');
		
		var oldfps = $("#oldFramerate").val();
		var newfps = $("#newFramerate").val();
		if(!oldfps.trim()) return alert('A native framerate value is required.');
		if(!newfps.trim()) return alert('A segment framerate value is required.');
		if(!$.isNumeric(oldfps) || !$.isNumeric(newfps)) return alert('Framerates must be numeric values.');
		
		calculateTimecodes(startcodes,endcodes,$("#oldFramerate").val(),$("#newFramerate").val());
	});
});

function convertFramerate(startframe,endframe,oldfps,newfps)
{
	return (endframe - startframe) * newfps / oldfps;
}

function calculateTimecodes(startframes,endframes,oldfps,newfps)
{
	var startcodes = [];
	var endcodes = [];
	
	var cur = startframes[0];
		
	$.each(startframes, function(i, item) {
		if(startframes[i] != cur)
			cur = +cur + +startframes[i] - +endframes[i-1];
		startcodes.push(cur);
		var count = convertFramerate(startframes[i],endframes[i],oldfps,newfps);
		cur = +cur + Math.floor(+count);
		endcodes.push(cur);
	});
	var data = "# timecode format v1\r\nassume " + oldfps + "\r\n";
	
	$.each(startcodes, function(i, item) {
		data += startcodes[i]+","+endcodes[i]+","+newfps+"\r\n";
	});
	
	download(data, "timecodes.txt", "text/plain");
}

function download(strData, strFileName, strMimeType) {
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

    //build download link:
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);


    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    } /* end if(window.MSBlobBuilder) */



    if ('download' in a) { //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            var e = D.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            D.body.removeChild(a);
        }, 66);
        return true;
    }; /* end if('download' in a) */



    //do iframe dataURL download: (older W3)
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
}
