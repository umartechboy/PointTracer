//////////////////////////////////////////////////////////////
///////////////         DrawableAxis      ////////////////////
//////////////////////////////////////////////////////////////

class DrawableAxis {
	constructor() {
		this.axisColor = 'black'
		this.axisMajorLines = 'darkgray'
		this.axisMinorLines = 'lightgray'
		this.backColor = 'white'
		this.textColor = 'black';
		this.MaxDisplayedValue = 0;
		this.MinDisplayedValue = 0;
		this.AverageMax = new List();
		this.AverageMin = new List();
		this.maxDisplayedValue_Avg = 0;
		this.minDisplayedValue_Avg = 0;
		this.DefaultScalingMode = AutoscalingMode.Autoscroll;
		this.OffsetG = 0;
		this.PPU = 1;
		this.totalScrollV = 0;
		this._ascale = 0;
		this.PlotBounds = new Rectangle(0, 0, 200, 100);
		this.VAtMouseDown = 0;
		this.GAtMouseDown = 0;
		this.Title = 'Axis';
		this.MarkerCursorG = new Point(0, 0);
		this.CurrentMoveOp = MoveOp.None;
		this._AxisBounds = new Rectangle(0, 100, 200, 10);
		this.DefaultScaleOp = MoveOp.None;
		this.AverageMax = new List();
		this.AverageMin = new List();
		this.lastScrollV = 0;
	}

	get AxisBounds() {
		return this._AxisBounds;
	}
	set AxisBounds(value) {
		this._AxisBounds = value;
		if (!isFinite(this._AxisBounds.Width))
			console.log('woww!');
	}
	GtoV(vG) {
		return this.GtoV3(vG, this.OffsetG, this.PPU);
	}
	get OffsetV() {
		return this.OffsetG / this.PPU;
	}
	set OffsetV(value) {
		this.OffsetG = value * this.PPU;
	}
	get AutoScale() {
		return this._ascale;
	}
	set AutoScale(value) {
		this._ascale = value;
		if (value)
			this.AutoSetScale();
	}

	NotifyScroll(v) {
		var dv = v - this.lastScrollV;
		this.lastScrollV = v;
		this.totalScrollV += dv;
		//OffsetV(OffsetV() - dv);
	}
	//AutoScaleLoop()
	//{
	//	if (!isNaN(this.MaxDisplayedValue) && isFinite(this.MaxDisplayedValue))
	//	{
	//		if (this.MaxDisplayedValue > MIN_VALUE)
	//		{
	//			this.AverageMax.Add(this.MaxDisplayedValue);
	//			if (this.AverageMax.Count > 30)
	//				this.AverageMax.RemoveAt(0);
	//		}
	//	}
	//	if (!isNaN(this.MinDisplayedValue) && isFinite(this.MinDisplayedValue))
	//	{
	//		if (this.MinDisplayedValue < MAX_VALUE / 2)
	//		{
	//			this.AverageMin.Add(this.MinDisplayedValue);
	//			if (this.AverageMin.Count > 30)
	//				this.AverageMin.RemoveAt(0);
	//		}
	//		else
	//		{ }
	//	}
	//	if (this.AverageMax.Count > 0)
	//		this.maxDisplayedValue_Avg = this.AverageMax.Average();
	//	if (this.AverageMin.Count > 0)
	//		this.minDisplayedValue_Avg = this.AverageMin.Average();
	//	// smooth auto scroll
	//	if (this.DefaultScalingMode == AutoscalingMode.Autoscroll)
	//	{
	//		if (this.AutoScale)
	//		{
	//			var thisV = 0.1 * totalScrollV;
	//			if (thisV > 1e-30)
	//			{
	//				this.OffsetV -= thisV;
	//				this.totalScrollV -= thisV;
	//			}
	//		}
	//	}

	//}
	VtoG3(v, offsetG, ppu) {

	}
	VtoG1(v) {
		return VtoG3(v, OffsetG, PPU);
	}
	GtoV3(vG, offsetG, ppu) {

	}
	GtoV1(vG) {
		return this.GtoV3(vG, OffsetG, PPU);
	}

	_AutoSetScale(maxWidthG) {

		//log("mode: " + this.DefaultScalingMode + ", autoscale: " + this.AutoScale);
		if (!this.AutoScale)
			return;

		if (this.DefaultScalingMode == AutoscalingMode.Autoscroll) {
			var thisV = 0.1 * this.totalScrollV;
			if (thisV > 1e-30) {
				//log("this.totalScrollV: " + this.totalScrollV);
				this.OffsetV -= thisV;
				this.totalScrollV -= thisV;
				this.NeedsRefresh = true;
			}
		}
		else {
			this.AverageMax.Add(this.MaxDisplayedValue);
			this.AverageMin.Add(this.MinDisplayedValue);
			if (this.AverageMax.Count > 30)
				this.AverageMax.RemoveAt(0);
			if (this.AverageMin.Count > 30)
				this.AverageMin.RemoveAt(0);

			var currentMax = this.AverageMax.Average();
			var currentMin = this.AverageMin.Average();

			var SignificantFiguresAfterDecimal = 2;
			if (currentMin == currentMax) {
				var inc = currentMin * 0.1;
				if (inc == 0)
					inc = 0.001;
				currentMin -= inc;
				currentMax += inc;
			}
			var fac = 0.9;
			var cover = 0.4;
			var idealXPPU = maxWidthG / (currentMax - currentMin) * cover;
			if (idealXPPU > Math.pow(10, SignificantFiguresAfterDecimal) * 5000)
				idealXPPU = Math.pow(10, SignificantFiguresAfterDecimal) * 5000;
			if (currentMax - currentMin > 0)
				this.PPU = this.PPU * fac + idealXPPU * (1 - fac);

			var idealOffsetG = -(currentMax + currentMin) / 2 * idealXPPU + maxWidthG / 2;
			this.OffsetG = this.OffsetG * fac + idealOffsetG * (1 - fac);
		}
	}
	SizeChanged(horizontalAxisBoundsG, verticalAxisBoundsG, plotBoundsG) {
		this.PlotBounds = plotBoundsG;
		//ScrollWithSizeChange(new SizeF(plotBoundsG.Width - lastSize.Width, plotBoundsG.Height - lastSize.Height));
		//lastSize = new SizeF(plotBoundsG.Size.Width, plotBoundsG.Height);
		//if (!DontScrollPlotOnReSize)
		//    resetToZero();
	}

	ScaleChanged(latestPoint, lastPoint) { }
	RegisterMouseDown(eG) { }
	OffsetChanged(latestPoint, lastPoint) { }
	DrawAxisAndGrid(g, f) { }

}


//////////////////////////////////////////////////////////////
///////////         DrawableVerticalAxis      ////////////////
//////////////////////////////////////////////////////////////

class DrawableVerticalAxisRight extends DrawableAxis
{		  
	constructor()
	{
		super();
		this.Title = 'y axis';
		this.DefaultScaleOp = MoveOp.yZoom;
		this.MarkerCursorG = new Point(NaN, NaN);
		this.AutoScale = true;
		this.DefaultScalingMode = AutoscalingMode.Autoscale;
	}
	ScaleChanged(latestPoint, lastPoint)
	{
		var changeG = -(latestPoint.Y - lastPoint.Y);
		var totalShownV = this.AxisBounds.Height / this.PPU;
		var changeV = -(changeG) / this.PPU;
		var newTotalV = totalShownV + changeV;
		if (newTotalV < 0)
			return;
		this.PPU = this.AxisBounds.Height / newTotalV;
		this.OffsetG = (this.AxisBounds.Height - this.GAtMouseDown) - this.VAtMouseDown * this.PPU;
	}
	OffsetChanged(latestPoint, lastPoint)
	{
		this.OffsetG += -(latestPoint.Y - lastPoint.Y);
	}
	ScrollWithSizeChange(change)
	{
		if (this.DefaultScalingMode == AutoscalingMode.Autoscroll)
			this.OffsetG -= change.Height;
	}
	
	resetToZero()
	{
		OffsetG = this.PlotBounds.Height / 2;
	}
	AutoSetScale()
	{
		if (!this.AutoScale)
			return;
		this._AutoSetScale(this.PlotBounds.Height);
	}
	DrawAxisAndGrid(g, tickFont)
	{
		this.AxisBounds.Height = this.PlotBounds.Height;
		this.AxisBounds.Y = this.PlotBounds.Y;   
		var ys = this.PPU;
		var yog = this.OffsetG;

		// X Axis
		var axisP = new Pen(this.axisColor, 1.5);
		var majLine = new Pen(this.axisMajorLines, 1);
		var minLine = new Pen(this.axisMinorLines, 1);

		// Y Axis
		var unitY = 1e-6;
		var multF = 5;
		multF = 5;
		var iterations = 0;
		// determine scale first
		while (unitY * ys < tickFont.Height * 1.5)
		{
			if (!isFinite(unitY * multF))
			{ unitY = MIN_VALUE; break; }
			// if (!isFinite(unitY * multF))
			// { unitY = var.MaxValue; break; }
			unitY *= multF;
			multF = multF == 2 ? 5 : 2;
			if (unitY < 1e-6)
				break;
		}
		//if (unitY < 1e-7 || unitY > 1e7)
		//    return drawingRect;

		var minY = Math.round(-yog / ys) * unitY, maxY = Math.round((this.AxisBounds.Height - yog) / ys) * unitY;
		while (minY * ys < -yog)
		{
			if (!isFinite(minY + unitY))
			{ minY = MAX_VALUE; break; }
			minY += unitY;
		}
		while (minY * ys + yog > 0)
		{
			if (!isFinite(minY - unitY))
			{ minY = MIN_VALUE; break; }
			minY -= unitY;
		}

		while (maxY * ys + yog > this.AxisBounds.Height)
		{
			if (!isFinite(maxY - unitY))
			{ minY = MIN_VALUE; break; }
			maxY -= unitY;
		}
		while (maxY * ys + yog < this.AxisBounds.Height)
		{
			if (!isFinite(maxY + unitY))
			{ maxY = MAX_VALUE; break; }
			maxY += unitY;
		}

		var isMinLine = false;
		var ySigFiguresAfterD = 0;
		var totalFigs = (unitY / 2 - Math.floor(unitY / 2)).toString().length - 2;

		while (Math.round(unitY, ySigFiguresAfterD) == Math.round(unitY / 2, ySigFiguresAfterD)
			&& ySigFiguresAfterD <= totalFigs)
			ySigFiguresAfterD++;
		for (let i = minY; i <= maxY; i += unitY / 2)
		{
			//PointF drawableMid = VtoG(new PointF(0, i), 1, 1, yog / ys, ys, this.PlotBounds.Height);
			//drawableMid = new PointF(PlotBounds.Width, drawableMid.Y);

			var drawable1 = new Point(this.PlotBounds.X, this.PlotBounds.Height - (this.PlotBounds.Y + i * ys + yog));
			var drawable2 = new Point(this.PlotBounds.X + this.PlotBounds.Width, this.PlotBounds.Height - (this.PlotBounds.Y + i * ys + yog));
			if (!isMinLine)
			{
				drawable2 = new Point(this.PlotBounds.X + this.PlotBounds.Width + 5, this.PlotBounds.Height - (this.PlotBounds.Y + i * ys + yog));

				var s = new DXString(i.toFixed(4), 0)
				s.Color = 'gray';
				s.Font = tickFont;
				var xyo = g.MeasureString(s);
				var drawableStrPos = new Point(this.AxisBounds.X + 6, drawable2.Y - xyo.Height / 2);
				if (drawable2.Y < this.PlotBounds.Y + this.PlotBounds.Height && drawable2.Y > this.PlotBounds.Y)
				{
					g.DrawLine(majLine, drawable1, drawable2);
					g.DrawString(s, drawableStrPos.X, drawableStrPos.Y);

				}
			}
			else
			{               
				if (drawable2.Y < this.PlotBounds.Height && drawable2.Y > 0)
					g.DrawLine(minLine, drawable1, drawable2);         
			}
			isMinLine = !isMinLine;
		}
		
		// zero line
		if (yog < this.AxisBounds.Height && yog > 0)
			g.DrawLine(axisP, new Point(this.PlotBounds.X, this.PlotBounds.Y + this.PlotBounds.Height - yog), new Point(this.PlotBounds.X + this.PlotBounds.Width, this.PlotBounds.Y + this.PlotBounds.Height - yog));
		
		var str = new DXString(this.Title, 24);
		str.Color = 'black'
		var sz = g.MeasureString(str);
		g.TranslateTransform(this.PlotBounds.Width + 75, this.PlotBounds.Height / 2 + sz.Width / 2);
		g.RotateTransform(-Math.PI / 2);
		g.DrawString(str, 0,0);
		g.UndoTransform();
		g.UndoTransform();
		//var sz = g.MeasureString(str);
		//g.DrawString(str, this.AxisBounds.Width / 2 - sz.Width / 2, this.AxisBounds.Y + 30);
	}

	goToZero()
	{
		this.OffsetG = -this.PlotBounds.Height/2;
	}

	VtoG3(v, offsetG, ppu)
	{
		return  -(v * ppu + offsetG) + this.AxisBounds.Height;
	}
	GtoV3(vG, offsetG, ppu)
	{
		return ((this.AxisBounds.Height - vG) - offsetG) / ppu;
	}
	RegisterMouseDown(eG)
	{
		this.GAtMouseDown = eG.Y;
		this.VAtMouseDown = this.GtoV(eG.Y);
	}
	SizeChanged(horizontalAxisBoundsG, verticalAxisBoundsG, PlotBounds)
	{
		super.SizeChanged(horizontalAxisBoundsG, verticalAxisBoundsG, PlotBounds);
		this.AxisBounds = verticalAxisBoundsG;
		this.PlotBounds = PlotBounds;
	}
	
	DrawMarkers(g, f, BackColor)
	{
		if (isNaN(this.MarkerCursorG.Y))
			return;
		var CursorV = Math.round(this.GtoV(this.MarkerCursorG.Y)*100) / 100;
		var num = new DXString(CursorV.toString(), 1);
		num.Font = f;
		num.Color = this.textColor;
		var strSz = g.MeasureString(num);
		g.FillRectangle(BackColor, this.AxisBounds.X + 8, this.MarkerCursorG.Y - strSz.Height/2, strSz.Width, strSz.Height);
		g.DrawString(
			num,
			this.AxisBounds.X + 8,
			this.MarkerCursorG.Y - strSz.Height / 2);

		g.DrawLine(new Pen(this.textColor, 1), new Point(this.PlotBounds.X, this.MarkerCursorG.Y), new Point(this.AxisBounds.X, this.MarkerCursorG.Y));
	}
}



//////////////////////////////////////////////////////////////
///////////         DrawableHorizontalAxis      ////////////////
//////////////////////////////////////////////////////////////

class DrawableHorizontalAxis extends DrawableAxis
{
	constructor	()
	{
		super();
		this.Title = 'x axis';
		this.DefaultScaleOp = MoveOp.xZoom;
		this.MarkerCursorG = new Point(NaN, NaN);
		this.AutoScale = true;
		this.DefaultScalingMode = AutoscalingMode.Autoscroll;
	}
	ScaleChanged(latestPoint, lastPoint)
	{
		var changeG = latestPoint.X - lastPoint.X;
		var totalShownV = this.AxisBounds.Width / this.PPU;
		var changeV = -(changeG) / this.PPU;
		var newTotalV = totalShownV + changeV;	
		if (newTotalV < 0)
			return;
		this.PPU = this.AxisBounds.Width / newTotalV;
		this.OffsetG = this.GAtMouseDown - this.VAtMouseDown * this.PPU;
	}
	OffsetChanged(latestPoint, lastPoint)
	{
		this.OffsetG += (latestPoint.X - lastPoint.X);
	}
	
	DrawMarkers(g, f, BackColor)
	{
		if (isNaN(this.MarkerCursorG.X))
			return;
		var CursorV = Math.round(this.GtoV(this.MarkerCursorG.X)*100) / 100;
		var num = new DXString(CursorV.toString(), 1);
		num.Font = f;
		num.Color = this.textColor;
		var strSz = g.MeasureString(num);
		g.FillRectangle(BackColor, this.MarkerCursorG.X - strSz.Width / 2, this.PlotBounds.Height + 1, strSz.Width, strSz.Height + 5);
		g.DrawString(
			num,
			this.MarkerCursorG.X - strSz.Width / 2,
			this.AxisBounds.Y + 5);

		g.DrawLine(new Pen(this.textColor, 1), new Point(this.MarkerCursorG.X, this.PlotBounds.Y), new Point(this.MarkerCursorG.X, this.AxisBounds.Y));
	}

	SizeChanged(horizontalAxisBoundsG, verticalAxisBoundsG, PlotBounds)
	{
		super.SizeChanged(horizontalAxisBoundsG, verticalAxisBoundsG, this.PlotBounds);
		this.AxisBounds = horizontalAxisBoundsG;
		this.PlotBounds = PlotBounds;
	}
	ScrollWithSizeChange(change)
	{
		if (this.DefaultScalingMode == AutoscalingMode.Autoscroll)
			this.OffsetG += change.Width;
	}
	resetToZero()
	{
		this.OffsetG = this.PlotBounds.Width;
		this.totalScrollV = 0;
	}
	AutoSetScale()
	{
		if (!this.AutoScale)
			return;
		this._AutoSetScale(this.PlotBounds.Width);
	}
	DrawAxisAndGrid(g, tickFont)
	{
		this.AxisBounds.Width = this.PlotBounds.Width;
		this.AxisBounds.X = this.PlotBounds.X;
		var xs = this.PPU;
		var xog = this.OffsetG;
		// X Axis
		var axisP = new Pen(this.axisColor, 1.5);
		var majLine = new Pen(this.axisMajorLines, 1);
		var minLine = new Pen(this.axisMinorLines, 1);

		var unitX = 1 / Math.pow(10, 2);
		var multF = 5;
		// determine scale first
		var testValue = 123.123456;
		
		var testS = new DXString(testValue.toString(), 1);
		testS.Font = tickFont;
		var testSz = g.MeasureString(testS);
		while (unitX * xs < testSz.Width)
		{
			unitX *= multF;
			multF = multF == 2 ? 5 : 2;
		}

		var minX = 0, maxX = 0;
		while (minX * xs < -xog)
		{
			if (!isFinite(minX + unitX))
			{ minX = MAX_VALUE; break; }
			minX += unitX;
		}
		while (minX * xs > -xog)
		{
			if (!isFinite(minX - unitX))
			{ minX = MIN_VALUE; break; }
			minX -= unitX;
		}

		while (maxX * xs > this.PlotBounds.Width - xog)
		{
			if (!isFinite(maxX - unitX))
			{ minX = MIN_VALUE; break; }
			maxX -= unitX;
		}
		while (maxX * xs < this.PlotBounds.Width - xog)
		{
			if (!isFinite(maxX + unitX))
			{ maxX = MAX_VALUE; break; }
			maxX += unitX;
		}



		var xaHei = (tickFont.Height * 15 / 10);
		var isMinLine = false;

		var xSigFiguresAfterD = 0;
		var totalFigs = (unitX / 2 - Math.floor(unitX / 2)).toString().length - 2;

		while (Math.round(unitX, xSigFiguresAfterD) == Math.round(unitX / 2, xSigFiguresAfterD)
			&& xSigFiguresAfterD <= totalFigs)
			xSigFiguresAfterD++;

		for (let i = minX; i <= maxX; i += unitX / 2)
		{
			//PointF drawableMid = VtoG(new PointF(i, 0), xog / xs, xs, 1, 0);
			//drawableMid = new PointF(drawableMid.X, h);

			var drawable1 = new Point(i * xs + xog + this.PlotBounds.X, this.PlotBounds.Y);
			var drawable2 = new Point(i * xs + xog + this.PlotBounds.X, this.PlotBounds.Y + this.PlotBounds.Height);
			//if (grid)
			//drawable1 = new PointF(drawable1.X, 0);
			//if (grid)
			//drawable2 = new PointF(drawable2.X, h - xaHei);
			var s = new DXString(i.toString(), 1);
			s.Color = 'gray';
			s.Font = tickFont;
			var xyo = g.MeasureString(s);
			var drawableStrPos = new Point(drawable2.X - xyo.Width / 2, this.AxisBounds.Y + 8);
			if (!isMinLine)
			{
				drawable2 = new Point(i * xs + xog + this.PlotBounds.X, this.PlotBounds.Y + this.PlotBounds.Height + 5);
				if (drawable1.X < this.PlotBounds.Width && drawable1.X >= 0)
				{
					g.DrawLine(majLine, drawable1, drawable2);
					g.DrawString(s, drawableStrPos.X, drawableStrPos.Y);
				}
			}
			else
			{
				if (drawable1.X < this.PlotBounds.Width && drawable1.X > 0)
				{
					g.DrawLine(minLine, drawable1, drawable2);
				}
			}
			isMinLine = !isMinLine;
		}
		if (xog < this.PlotBounds.Width && xog > 0)
			g.DrawLine(axisP, new Point(xog, 0), new Point(xog, this.PlotBounds.Height));

		var str = new DXString(this.Title, 24);
		str.Color = 'black'
		var sz = g.MeasureString(str);
		g.DrawString(str, this.AxisBounds.Width / 2 - sz.Width / 2, this.AxisBounds.Y + 30);
	}
	ScrollToEnd()
	{
		OffsetV = -MaxDisplayedValue;
		OffsetG += this.PlotBounds.Width - 100;
		NeedsRefresh = true;
	}

	goToZero()
	{
		this.OffsetG = -this.PlotBounds.Width;
	}
	RegisterMouseDown(eG)
	{
		this.GAtMouseDown = eG.X;
		this.VAtMouseDown = this.GtoV(eG.X);
	}
	VtoG3(v, offsetG, ppu)
	{
		return v * ppu + offsetG;
	}
	GtoV3(vG, offsetG, ppu)
	{
		return (vG - offsetG) / ppu;
	}
}