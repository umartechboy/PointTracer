//////////////////////////////////////////////////////////////
////////////            DXForm      //////////////////////////
//////////////////////////////////////////////////////////////
var PaintTick = null;
class DXForm
{
	constructor() {
		this.DXControls = new List();
		this.MouseWentDownAt = new Point();
		this.currentControlUnderMouse = null;
		this.CaretFocus = null;
		this.openFileChild = null;
	}
	FormOpenFileCallBack(event) {
		document.body.removeChild(this.openFileChild);
		this.openFileCallBack(event.target.files);
		//new OpenFileDialogResult(event, (res) => { this.openFileCallBack(res); });
	}
	SaveTextFile(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
	OpenFile(callback, filter) {
		if (filter == null)
			filter = accept = "*";
		var container = document.createElement('div');
		this.openFileCallBack = null;
		container.id = "openFileInput";
		$('body').append(container);
		var html = "<input type='file' style='display: none' accept='" + filter + "' id='formFileInput' onchange='Form.FormOpenFileCallBack(event)'/>";
		//log(html);
		$('#openFileInput').append(html);
		document.body.append("");
		this.openFileChild = container;


		this.openFileCallBack = callback;
		$("input").trigger("click");
    }
	OnPaint(hyg)
	{
		if (PaintTick != null)
			PaintTick();
		hyg.Clear('white');
		for (let i = 0; i < this.DXControls.Count; i++)
		{
			var control = this.DXControls.InnerList[i];
			if (control == null)
				continue;
			var x = control.Left;
			var y = control.Top;

			hyg.TranslateTransform(x, y);
			control.BasePaint(hyg);
			hyg.UndoTransform();
		}
		if (this.CaretFocus != null)
		hyg.FillRectangle('rgba(0,0,0,0.6)',0,0,3000,2000);
	}
	
	AddDXControl(control)
	{
		this.DXControls.Add(control);
		control.AddedToParent(null);
		return control;
	}

	GetDXControlsZOrdered(highestFirst) {
		var out = new List();
		for (var i = 0; i < this.DXControls.Count; i++) {
			out.Add(this.DXControls.InnerList[i]);
		}
		for (var i = 0; i < this.DXControls.Count; i++) {
			for (var j = i + 1; j < this.DXControls.Count; j++) {
				if (highestFirst) {
					if (out.InnerList[j].ZOrder > out.InnerList[i].ZOrder) {
						var t = out.InnerList[i];
						out.InnerList[i] = out.InnerList[j];
						out.InnerList[j] = t;
					}
				}
				else {
					if (out.InnerList[j].ZOrder < out.InnerList[i].ZOrder) {
						var t = out.InnerList[i];
						out.InnerList[i] = out.InnerList[j];
						out.InnerList[j] = t;
					}
				}
			}
		}
		return out;
	}
}
function requestInstantDisplay() {
	var g = new HybridGraphics(Canvas);
	Form.OnPaint(g);
	SharedResources.AnimationLoop();
}
function ApplicationRun()
{
	requestInstantDisplay();
	loop();
	requestAnimationFrame(ApplicationRun);
} 
var Form = new DXForm();
addEventListener("mousemove", (e) => {

	var rect = canvas.getBoundingClientRect();
	x = e.clientX - rect.left;
	y = e.clientY - rect.top;
	var e2 = new MouseEventArgs(x, y);
	if (Form.CaretFocus != null) {
		return;
	}

	var controls = Form.GetDXControlsZOrdered(false);
	for (let i = controls.Count - 1; i >= 0; i--)
		if (controls.InnerList[i].ProcessMouseMove(e2, Form.currentControlUnderMouse))
			break;
});
addEventListener("mousedown", (e) => {
	var rect = canvas.getBoundingClientRect();
	x = e.clientX - rect.left;
	y = e.clientY - rect.top;
	var e2 = new MouseEventArgs(x, y);
	Form.MouseWentDownAt = new Point(x, y);

	if (Form.CaretFocus != null) {
		// send the changed text to the control;
		if (Form.CaretFocus.TopParentBoundsContains(e2))
			return;
		Form.CaretFocus.NotifyCaretEnd();
		Form.CaretFocus = null;
		return;
	}
	//log('Down at:' + x + ', '+ y);
	var controls = Form.GetDXControlsZOrdered(false);
	for (let i = controls.Count - 1; i >= 0; i--){
		Form.currentControlUnderMouse = controls.InnerList[i].ProcessMouseDown(e2);
		if (Form.currentControlUnderMouse != null)
			return;
	}
});
addEventListener("mouseup", (e) => {
  
  var rect = canvas.getBoundingClientRect();
  x =  e.clientX - rect.left;
  y = e.clientY - rect.top;
  var e2 = new MouseEventArgs(x,y);

	if (Form.CaretFocus != null) {
		return;
	}
  //log('Up at:' + x + ', '+ y);
  var controls = Form.GetDXControlsZOrdered(false);
  for (let i = Form.DXControls.Count - 1; i >= 0; i--)
	  controls.InnerList[i].ProcessMouseUp(e2, Form.currentControlUnderMouse);
  Form.currentControlUnderMouse = null;
});
addEventListener("click", (e) => {
	var rect = canvas.getBoundingClientRect();
	x =  e.clientX - rect.left;
	y = e.clientY - rect.top;
    var e2 = new MouseEventArgs(x,y);
	
	return;
    //log('Click at:' + x + ', '+ y);
	if (Form.MouseWentDownAt.X != x || Form.MouseWentDownAt.Y != y)
	  return;
	for (let i = Form.DXControls.Count - 1; i >= 0; i--)
		Form.DXControls.InnerList[i].ProcessMouseClick(e1, Form.currentControlUnderMouse);
});

class OpenFileDialogResult {
	constructor(event, readerLoad) {
		this.File = event.target.files[0];
		this.AllFileURLs = new List();

		this.FileReader = new FileReader();
		var reader = new FileReader();
		reader.onload = function (e) {
			log("loaded");
			readerLoad(URL.createObjectURL(this.File));
		};

		log("reader made: " + event.target.files[0]);
		this.FileReader.readAsDataURL(event.target.files[0]);
    }
}