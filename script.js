$(document).ready(function() {

	var wrapper         	= $("#timecodes-wrapper");
	var addButton			= $("#add-field-button");
	var submitButton		= $("#calculate-button");
	
	// Define the HTML to generate for new timecodes.
	var deleteButtonHTML	= "<a class='btn-remove btn btn-xs btn-danger'>Remove</a>";
	var newTimecodeHTML		= wrapper.html().replace(addButton[0].outerHTML, deleteButtonHTML);

    $(addButton).click(function(e) {
        e.preventDefault();
		$(wrapper).append(newTimecodeHTML);
    });
   
    $(wrapper).on("click", ".btn-remove", function(e) {
        e.preventDefault();
		$(this).parent("div").remove();
    });
	
	$(submitButton).click(function(e){
		e.preventDefault();
		
		// Retrieve and validate framerates.
		var nativeFramerate = $("#native-framerate-input").val();
		var segmentFramerate = $("#segment-framerate-input").val();
		
		if(!nativeFramerate.trim()) {
			return alert("A native framerate value is required.");
		}
		else if(!segmentFramerate.trim()) {
			return alert("A segment framerate value is required.");
		}
		else if(!$.isNumeric(nativeFramerate) || !$.isNumeric(segmentFramerate)) {
			return alert("Framerates must be numeric values.");
		}
		
		// Retrieve and validate frame numbers.
		var startFrames = [];
		var endFrames = [];
		
		var errorFlag = false;
		
		// Store valid frame segments.
		$('.timecode').each(function() {
			var startFrame = $(this).find("input[name='start-frame-input[]']").val();
			var endFrame = $(this).find("input[name='end-frame-input[]']").val();
			
			if(
				Math.floor(startFrame) != startFrame 
				|| !$.isNumeric(startFrame) 
				|| Math.floor(endFrame) != endFrame 
				|| !$.isNumeric(endFrame)) {
				errorFlag = true;
			}
				
			startFrames.push(startFrame);
			endFrames.push(endFrame);
		});
		
		if(errorFlag) {
			return alert("Frame numbers must be valid integers.");
		}
		
		calculateTimecodes(startFrames, endFrames, nativeFramerate, segmentFramerate);
	});
});

function convertFramerate(startFrame, endFrame, oldFramerate, newFramerate)
{
	return (endFrame - startFrame) * newFramerate / oldFramerate;
}

function calculateTimecodes(startFrames, endFrames, nativeFramerate, segmentFramerate)
{
	var startCodes = [];
	var endCodes = [];
	
	var currentFrame = startFrames[0];
		
	$.each(startFrames, function(i, item) {
		if(startFrames[i] != currentFrame) {
			currentFrame = +currentFrame + +startFrames[i] - +endFrames[i - 1];
		}
		
		startCodes.push(currentFrame);
		
		var segmentLength = convertFramerate(startFrames[i], endFrames[i], nativeFramerate, segmentFramerate);
		currentFrame = +currentFrame + Math.floor(+segmentLength);
		
		endCodes.push(currentFrame);
	});
	
	var data = "# timecode format v1\r\nassume " + nativeFramerate + "\r\n";
	
	$.each(startCodes, function(i, item) {
		data += startCodes[i] + "," + endCodes[i] + "," + segmentFramerate + "\r\n";
	});
	
	download(data, "timecodes.txt", "text/plain");
}

// Download function based on https://github.com/rndme/download/
function download(strData, strFileName, strMimeType) {
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

    // Build download URL
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);

    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    } /* end if(window.MSBlobBuilder) */

    if ('download' in a) { // FF20, CH19
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

    // Do iFrame dataURL download (older W3)
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
}
