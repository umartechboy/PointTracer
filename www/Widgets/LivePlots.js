//////////////////////////////////////////////////////////////
//////////////         Live Plots      ///////////////////////
//////////////////////////////////////////////////////////////

class AutoscalingMode
{
	static Autoscale = 1;
	static Autoscroll = 2;
}
class LivePlots extends RemoteWidget {
	constructor(name, hw, left, top, width, height) {
		var vs = new VisualState(left, top, width, height, 1);
		vs.FaceColor = 'white';
		super(name, vs);
		this.HW = hw;
		this.xYPlotters = new List();
		this.leftPaneWidth = 0;

		// Merge button

		// // Take Screenshot
		// var screenshot = new RectangularPatch("screenshot", ThemedResources, new VisualState(0, 0, 44, 44, 1)
		// {
		// Image = ThemedResources.GetDXImage("screenshot"),
		// Radius = 7
		// })
		// {
		// Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left,
		// Cursor = System.Windows.Forms.Cursors.Hand
		// };
		// screenshot.VisualStates.SetupMouseHover(VisualPresets.Levitate);
		// screenshot.VisualStates.SetupMouseClick(VisualPresets.Levitate);

		// screenshot.OnClick += (s1, e1) =>
		// {
		// }

		// var lastTop = Height - 20;
		// for (int i = 1; i <= DXControls.Count; i++)
		// {
		// //DXControls[DXControls.Count - i].VisualStates.SetLeft(Width - DXControls[DXControls.Count - i].Width - 5);
		// DXControls[DXControls.Count - i].VisualStates.SetTop(lastTop - DXControls[DXControls.Count - i].Height - 16);
		// lastTop = DXControls[DXControls.Count - i].Top;
		// }
	}
	Feed() {
		for (var i = 0; i < this.xYPlotters.Count; i++)
			this.xYPlotters.InnerList[i].Feed();
		this.NeedsToRedraw = true;
	}
	AddNewPlotter() {
		var existingXAxis = null;
		var xSource = null;
		for (let i = 0; i < this.xYPlotters.Count; i++) {
			var axis = this.xYPlotters.InnerList[i].XAxis;
			if (axis != null)
				existingXAxis = axis;
		}
		// foreach (var series in xYPlotters.Select(xyp => xyp.XSeries))
		// {
		// if (series != null)
		// xSource = series;
		// }
		if (existingXAxis == null)
			existingXAxis = new DrawableHorizontalAxis();

		var plot = new XYPlot("xy plot " + (this.xYPlotters.Count + 1), this.leftPaneWidth, 0, this.Width - this.leftPaneWidth, this.Height);
		plot.SetXAxis(existingXAxis, true);
		if (xSource != null)
			plot.SetXSource(xSource);
		this.xYPlotters.Add(plot);

		var cHeight = this.Height;
		cHeight = (this.Height - 15 * (this.xYPlotters.Count - 1)) / (this.xYPlotters.Count);
		for (let i = 0; i < this.xYPlotters.Count; i++) {
			this.xYPlotters.InnerList[i].VisualStates.SetTop1((cHeight + 15) * i);
			this.xYPlotters.InnerList[i].VisualStates.SetSize(this.xYPlotters.InnerList[i].Width, cHeight);
			this.xYPlotters.InnerList[i].ResetAxisBounds();
		}
		this.AddDXControl(plot);
	}

	SetXSource(q, index) {

		if (index == null)
			index = -1;
		if (index == -1)
			for (var i = 0; i < this.xYPlotters.Count; i++)
				this.xYPlotters.InnerList[i].SetXSourceQ(q);
		else if (index >= 0)
			this.xYPlotters.InnerList[index].SetXSourceQ(q);
		this.ResetData();
	}

	AddYSource(q, index) {
		if (index >= 0 && index < this.xYPlotters.Count)
			this.xYPlotters.InnerList[index].AddYSourceQ(q);
		this.ResetData();
	}
	NotifyUserResized() {
		var cHeight = this.Height;
		cHeight = (this.Height - 15 * (this.xYPlotters.Count - 1)) / (this.xYPlotters.Count());
		for (var i = 0; i < this.xYPlotters.Count(); i++) {
			this.xYPlotters.InnerList[i].VisualStates.SetTop1((cHeight + 15) * i);
			this.xYPlotters.InnerList[i].VisualStates.SetHeight(cHeight);
			this.xYPlotters.InnerList[i].ResetAxisBounds();
		}
	}
	ResetData() {
		for (var i = 0; i < this.xYPlotters.Count; i++) {
			if (this.xYPlotters.InnerList[i].XAxis.XDataSeries != null)
				this.xYPlotters.InnerList[i].XDataSeries.ResetData();
			for (var j = 0; j < this.xYPlotters.InnerList[i].YDataSeries.Count; j++) {
				this.xYPlotters.InnerList[i].YDataSeries.InnerList[j].ResetData();
			}
		}
	}
}