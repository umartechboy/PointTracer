//////////////////////////////////////////////////////////////
//////////////////         XYPlot      ///////////////////////
//////////////////////////////////////////////////////////////

class XYPlot extends RectangularPatch {
	constructor(name, left, top, width, height) {
		var vs = new VisualState(left, top, width, height, 1);
		vs.FaceColor = 'white';
		super(name, vs);
		this.SpaceDivision_XAxisHeight = 30;
		this.SpaceDivision_CommonAxisButtonHeight = 15;
		this.SpaceDivision_CommonYAxisWidth = 120;
		this.SpaceDivision_XAxisButtonSpace = 70;
		this.SpaceDivision_YAxisButtonSpace = 60;
		this.SpaceDivision_LegendSpace = 200;
		this.lastFedX = 0;
		this.XDataSeries = null;
		this.YDataSeries = new List();
		this.ResetAxisBounds();
		this.OnMouseMove.Add(this.AxisContainer_OnMouseMove);
		this.OnMouseDown.Add(this.AxisContainer_OnMouseDown);
		this.OnMouseUp.Add(this.AxisContainer_OnMouseUp);
		// OnAdded.Add(AxisContainer_OnAdded);
		this.axisColor = 'black';
		this.backColor = 'white'
		this.ResetAxisBounds();
		// populate starting axis
		this.SetXAxis(new DrawableHorizontalAxis(), true);
		this.SetYAxis(new DrawableVerticalAxisRight());

		this.XAxis.PPU = 100;
		this.XAxis.OffsetG = this.XAxis.PlotBounds.Width;
		this.ResetAxisBounds();
		this.Font = new DXFont('Arial', 16);
		this.LastMouse = new Point(0, 0);
		//this.ScreenLoopOffset = new Point(0, 0);
	}
	get XYAxis() {
		var range = new List();
		if (this.XAxis != null) range.Add(this.XAxis);
		if (this.YAxis != null) range.Add(this.YAxis);
		return range;
	}

	SetXAxis(axis, timeStyle) {
		if (timeStyle)
			axis.DefaultScalingMode = AutoscalingMode.Autoscroll;
		this.XAxis = axis;
		this.ResetAxisBounds();
	}
	Feed() {
		this.NeedsToRedraw = true;
		if (this.XDataSeries != null) {
			if (this.XDataSeries.BindingQuantity.getValue() < this.lastFedX)
				this.lastFedX = this.XDataSeries.BindingQuantity.getValue();
			if (this.XAxis.DefaultScalingMode == AutoscalingMode.Autoscroll)
			{
				if ((this.XDataSeries.BindingQuantity.getValue() - this.lastFedX) * this.XAxis.PPU < 2.5)
				return;
			}
			this.astFedX = this.XDataSeries.BindingQuantity.getValue();
			this.XDataSeries.Feed();
		}
		for (var i = 0; i < this.YDataSeries.Count; i++)
			this.YDataSeries.InnerList[i].Feed();
		//}
	}
	AxisContainer_OnMouseMove(s, e) {
		// our original axis container recevied e in local coordinates.
		var xyp = s;
		var eLocForSaving = new Point(
			e.Location.X,
			e.Location.Y);

		var eLoc = new Point(
			e.Location.X,
			e.Location.Y);

		var CurrentMoveOp = MoveOp.None;

		var _axis = xyp.XYAxis.Find((axis) => axis.CurrentMoveOp != MoveOp.None);
		if (_axis != null)
			CurrentMoveOp = _axis.CurrentMoveOp;
		if (CurrentMoveOp == MoveOp.None) {
			var definedMoveOp = MoveOp.None;
			for (let i = 0; i < xyp.XYAxis.Count; i++)  // check if we have a cursor outside the plot area
			{
				var axis = xyp.XYAxis.InnerList[i];
				if (axis.AxisBounds.Contains(eLoc.X, eLoc.Y)) {
					Canvas.style.cursor = axis.DefaultScaleOp == MoveOp.xZoom ? Cursors.SizeWE : Cursors.SizeNS;
					axis.TentativeOp = MoveOp.Zoom;
					axis.MarkerCursorG = eLoc;
					definedMoveOp = axis.TentativeOp;
					//break;
				}
				else
					axis.TentativeOp = MoveOp.xyPan;

			}  // foreach end
			if (definedMoveOp != MoveOp.None) {
				for (let i = 0; i < xyp.XYAxis.Count; i++)  // check if we have a cursor outside the plot area
				{
					var axis = xyp.XYAxis.InnerList[i];
					if (axis.TentativeOp != definedMoveOp)
						axis.TentativeOp = MoveOp.None;
				}
			}
			else {
				Canvas.style.cursor = Cursors.Default;

				for (let i = 0; i < xyp.XYAxis.Count; i++)  // check if we have a cursor outside the plot area
				{
					var axis = xyp.XYAxis.InnerList[i];
					axis.MarkerCursorG = new Point(NaN, NaN);
					axis.CurrentMoveOp = MoveOp.None;
					axis.TentativeOp = MoveOp.xyPan;
					//if (MenuStripIsShowing == null)
					//    HoverOver = null;
				}
				// Note: We are skipping the hover over series for now.
				//XAxis.TentativeOp = MoveOp.xyPan;
				//DataSeries HoverOver = null;
				//HoverOver = CheckHover(GtoV(eLoc, xOffsetG, XPPU, yOffsetG, YPPU, Height - XLabelHeight), 10 / XPPU, 10 / YPPU);
				//if (HoverOver != null)
				//    TentativeOp = MoveOp.selectSeries;
				//if (HoverOver != bkp)
				//{
				//    needsRefresh = true;
				//    if (HoverOver != null)
				//    {
				//        Cursor = Cursors.Help;
				//    }
				//}
			}
		} // if CurrentMoveOp.None
		else if (CurrentMoveOp == MoveOp.Zoom) {
			for (let i = 0; i < xyp.XYAxis.Count; i++)  // check if we have a cursor outside the plot area
			{
				var axis = xyp.XYAxis.InnerList[i];
				if (axis.CurrentMoveOp == MoveOp.Zoom)
					axis.ScaleChanged(eLoc, xyp.LastMouse);
			}
		}
		else if (CurrentMoveOp == MoveOp.xyPan || xyp.CurrentMoveOp == MoveOp.selectSeries) {
			for (let i = 0; i < xyp.XYAxis.Count; i++)  // check if we have a cursor outside the plot area
			{
				var axis = xyp.XYAxis.InnerList[i];
				axis.OffsetChanged(eLoc, xyp.LastMouse);
			}
		}

		// // cyclic mouse dragging
		// if (this.CurrentMoveOp == MoveOp.xyPan || this.CurrentMoveOp == MoveOp.Zoom || this.CurrentMoveOp == MoveOp.selectSeries)
		// {
		// var x = MousePosition.X;
		// if (x + 1 >= Screen.PrimaryScreen.Bounds.Width)
		// {
		// Cursor.Position = new Point(1, Cursor.Position.Y);
		// ScreenLoopOffset = new PointF(ScreenLoopOffset.X + Screen.PrimaryScreen.Bounds.Width, ScreenLoopOffset.Y);
		// eLocForSaving.X -= Screen.PrimaryScreen.Bounds.Width;
		// }
		// else if (x == 0)
		// {
		// Cursor.Position = new Point(Screen.PrimaryScreen.Bounds.Width - 2, Cursor.Position.Y);
		// ScreenLoopOffset = new PointF(ScreenLoopOffset.X - Screen.PrimaryScreen.Bounds.Width, ScreenLoopOffset.Y);
		// eLocForSaving.X += Screen.PrimaryScreen.Bounds.Width;
		// }
		// int y = Cursor.Position.Y;
		// if (y + 1 >= Screen.PrimaryScreen.Bounds.Height)
		// {
		// Cursor.Position = new Point(Cursor.Position.X, 1);
		// ScreenLoopOffset = new PointF(ScreenLoopOffset.X, ScreenLoopOffset.Y + Screen.PrimaryScreen.Bounds.Height);
		// eLocForSaving.Y -= Screen.PrimaryScreen.Bounds.Height;
		// }
		// else if (y == 0)
		// {
		// Cursor.Position = new Point(Cursor.Position.X, Screen.PrimaryScreen.Bounds.Height - 2);
		// ScreenLoopOffset = new PointF(ScreenLoopOffset.Y, ScreenLoopOffset.Y - Screen.PrimaryScreen.Bounds.Height);
		// eLocForSaving.Y += Screen.PrimaryScreen.Bounds.Height;
		// }
		// }
		xyp.LastMouse = new Point(eLocForSaving.X, eLocForSaving.Y);
	}

	AxisContainer_OnMouseDown(xyp, e2) {
		var eLoc = new Point(
			e2.Location.X - xyp.BoundsOnTopParent.X,
			e2.Location.Y - xyp.BoundsOnTopParent.Y);

		for (let i = 0; i < xyp.XYAxis.Count; i++)  // check if we have a cursor outside the plot area
		{
			var axis = xyp.XYAxis.InnerList[i];
			if (axis.TentativeOp != MoveOp.None) {
				axis.CurrentMoveOp = axis.TentativeOp;

				if (axis.CurrentMoveOp == MoveOp.xyPan)
					Canvas.style.cursor = Cursors.NoMove2D;
				else if (axis.CurrentMoveOp == MoveOp.Zoom)
					Canvas.style.cursor = axis.DefaultScaleOp == MoveOp.xZoom ? Cursors.NoMoveHoriz : Cursors.NoMoveVert;
				axis.RegisterMouseDown(eLoc);
			}
		}
		// these coordinates are in local rcs
		xyp.MouseDownAt = xyp.LastMouse;
	}
	AxisContainer_OnMouseUp(xyp, e2) {
		// remember, e is in global. we need local version for original axicContainer functions
		for (let i = 0; i < xyp.XYAxis.Count; i++)  // check if we have a cursor outside the plot area
		{
			var axis = xyp.XYAxis.InnerList[i];
			axis.CurrentMoveOp = MoveOp.None;
			axis.TentativeOp = MoveOp.None;
			//if (MenuStripIsShowing == null)
			//    HoverOver = null;
		}
	}

	ResetAxisBounds() {
		var yAxisCommonSize = new Size(this.SpaceDivision_CommonYAxisWidth, this.Height - this.SpaceDivision_XAxisHeight - this.SpaceDivision_XAxisButtonSpace);
		if (this.XAxis != null) {
			var maxYAxis = 1;

			var plotSize = new Size(this.Width - this.SpaceDivision_CommonYAxisWidth * maxYAxis - this.SpaceDivision_LegendSpace - this.SpaceDivision_YAxisButtonSpace, this.Height - this.SpaceDivision_XAxisHeight - this.SpaceDivision_XAxisButtonSpace);
			var xAxisSize = new Size(this.Width - this.SpaceDivision_CommonYAxisWidth * maxYAxis - this.SpaceDivision_LegendSpace - this.SpaceDivision_YAxisButtonSpace, this.SpaceDivision_XAxisHeight);

			this.XAxis.SizeChanged(
				new Rectangle(0, this.Height - this.SpaceDivision_XAxisHeight - this.SpaceDivision_XAxisButtonSpace, xAxisSize.Width, xAxisSize.Height),
				new Rectangle(this.Width - this.SpaceDivision_CommonYAxisWidth * maxYAxis - this.SpaceDivision_LegendSpace - this.SpaceDivision_YAxisButtonSpace, 0, yAxisCommonSize.Width, yAxisCommonSize.Height),
				new Rectangle(0, 0, plotSize.Width, plotSize.Height));
			if (this.YAxis != null)
				this.YAxis.SizeChanged(
					new Rectangle(0, this.Height - this.SpaceDivision_XAxisHeight - this.SpaceDivision_XAxisButtonSpace, xAxisSize.Width, xAxisSize.Height),
					new Rectangle(this.Width - this.SpaceDivision_CommonYAxisWidth * maxYAxis - this.SpaceDivision_LegendSpace - this.SpaceDivision_YAxisButtonSpace, 0, yAxisCommonSize.Width, yAxisCommonSize.Height),
					new Rectangle(0, 0, plotSize.Width, plotSize.Height));
		}
	}

	SetYAxis(yAxis) {
		if (this.YAxis == yAxis)
			return;
		this.YAxis = yAxis;
		this.ResetAxisBounds();
	}

	BasePaint(g) {
		// auto set scale     
		if (this.XYAxis.Count != 2)
			return;
		for (let i = 0; i < this.XYAxis.Count; i++) {
			var axis = this.XYAxis.InnerList[i]
			//g.Clip = new Region(new RectangleF(100, 100, 300, 300));
			axis.AutoSetScale();
			axis.DrawAxisAndGrid(g, this.Font);
			//axis.DrawMarkers(g, this.Font, this.backColor);
		}

		if (this.YDataSeries.Count > 0 && this.XDataSeries != null) {
			this.XAxis.MinDisplayedValue = +1e30;
			this.XAxis.MaxDisplayedValue = -1e30;
			this.YAxis.MinDisplayedValue = +1e30;
			this.YAxis.MaxDisplayedValue = -1e30;
			for (var i = 0; i < this.YDataSeries.Count; i++)
				this.YDataSeries.InnerList[i].Draw(g, this.XDataSeries, this.XAxis, this.YAxis);
		}
		var r = 9;
		var axisP = new Pen(this.axisColor, 1);
		var backP = new Pen('white', r);

		if (this.XAxis != null && this.YAxis != null) {
			g.DrawRoundedRectangle(backP, 3, 3, this.XAxis.AxisBounds.Width - 3, this.YAxis.AxisBounds.Height - 3, r);
			g.DrawRoundedRectangle(axisP, 3, 3, this.XAxis.AxisBounds.Width - 3, this.YAxis.AxisBounds.Height - 3, r);
		}
		// draw legend
		for (var i = 0; i < this.YDataSeries.Count; i++)
		{
			var lstr = new DXString(this.YDataSeries.InnerList[i].Title, 20, "black");
			var sz = g.MeasureString(lstr);
			g.DrawLine(new Pen(this.YDataSeries.InnerList[i].LineColor, 2),
				new PointF(this.Width - this.SpaceDivision_LegendSpace, 10 + 30 * i + sz.Height / 2),
				new PointF(this.Width - this.SpaceDivision_LegendSpace + 40, 10 + 30 * i + sz.Height / 2));
			g.DrawString(lstr, this.Width - this.SpaceDivision_LegendSpace + 45, 15 + 30 * i);
		}
	}

	SetXSourceQ(q) {
		if (q == null) // remove x
		{
			this.SetXSourceDS(null);
			return;
		}
		var ds = new DataSeries(q);
		this.SetXSourceDS(ds);
	}
	SetXSourceDS(ds) {
		if (ds == null)
		// remove
		{
			this.XDataSeries = ds;
			return;
		}
		var q = ds.BindingQuantity;

		// change the axis button text anyways.
		// now, create a new series. The series will have the same units as the axis.

		this.XDataSeries = ds;
		this.XDataSeries = ds;
		this.XAxis.PPU = 50;
		this.XAxis.OffsetV = -this.XDataSeries.BindingQuantity.getValue();
		this.XAxis.OffsetG += this.XAxis.PlotBounds.Width;
		this.ResetAxisBounds();
	}
	AddYSourceQ(q) {
		log("AddYSourceQ");
		if (q == null)
		// Remove
		{
			log("Remove y source");
			this.RemoveYSourceDS(null);
		}
		else {
			// make a new series and add it to stack
			var ds = new DataSeries(q);
			this.AddYSourceDS(ds);
		}
	}
	AddYSourceDS(ds) {
		log("AddYSourceDS");
		var q = ds.BindingQuantity;
		for (var i = 0; i < this.YDataSeries.Count; i++)
			if (this.YDataSeries.InnerList[i].BindingQuantity == q) {
				return;
			}

		// if axis is null, auto select one
		this.ResetAxisBounds();

		this.YDataSeries.Add(ds);
	}
}