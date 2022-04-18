class DataSeries {

    constructor(loggerQuantity) {
        this.DataSeriesCapacity = 1000;
        this.Data = new Array(this.DataSeriesCapacity);
        this.AutoscrollSubscriptions = new List();
        this.LineColor = "red";
        this.BindingQuantity = loggerQuantity;
        this.Title = "";
        this.DataCount = 0;
        this.Data_wr_ind = 0;
    }
    Feed() {
        var v = this.BindingQuantity.getValue();
        //log("Series feed: " + v);
        this.Data[this.Data_wr_ind] = v;
        this.Data_wr_ind++;
        if (this.Data_wr_ind >= this.DataSeriesCapacity)
            this.Data_wr_ind = 0;
        this.DataCount++;
        if (this.DataCount > this.DataSeriesCapacity)
            this.DataCount = this.DataSeriesCapacity;
        /*Serial.print(F("feed: "));
        Serial.print((Data_wr_ind - 1) % DataSeriesCapacity);
        Serial.print(F("."));
        Serial.println(v);*/
        for (var i = 0; i < this.AutoscrollSubscriptions.Count; i++) {
            this.AutoscrollSubscriptions.InnerList[i].NotifyScroll(v);
            //Serial.print(F("s "));
            //Serial.println(v);
        }
    }

    getValue(index) {
        index = (this.Data_wr_ind - this.DataCount + index);
        if (index >= this.DataSeriesCapacity)
            index -= this.DataSeriesCapacity;
        else if (index < 0)
            index += this.DataSeriesCapacity;
        return this.Data[index];
    }
    ResetData() {
        this.DataCount = 0;
        this.Data_wr_ind = 0;
    }

    Draw(g, xSeries, xAxis, yAxis) {
        g.SetClippingRegion(2, 2, xAxis.PlotBounds.Width - 4, xAxis.PlotBounds.Height - 4);
        //Serial.println(F("-----"));
        //if (this.DataCount > 100) {

        //    for (var i = 0; i < this.DataCount - 1; i++) {
        //        var x1 = xSeries.getValue(i)
        //        var y1 = this.getValue(i);
        //        log("[" + i + "] = " + x1 + ", " + y1);
        //    }
        //}
        var ps = new Array(this.DataCount );
        for (var i = 0; i < this.DataCount; i++) {
            var x1 = xAxis.VtoG3(xSeries.getValue(i), xAxis.OffsetG, xAxis.PPU);
            var y1 = yAxis.VtoG3(this.getValue(i), yAxis.OffsetG, yAxis.PPU);

            ps[i] = new Point(x1, y1);

            if (xSeries.getValue(i) < xAxis.MinDisplayedValue || isinf(xAxis.MinDisplayedValue))
                xAxis.MinDisplayedValue = xSeries.getValue(i);
            if (xSeries.getValue(i) > xAxis.MaxDisplayedValue || isinf(xAxis.MaxDisplayedValue))
                xAxis.MaxDisplayedValue = xSeries.getValue(i);

            if (this.getValue(i) < yAxis.MinDisplayedValue || isinf(yAxis.MinDisplayedValue))
                yAxis.MinDisplayedValue = this.getValue(i);
            if (this.getValue(i) > yAxis.MaxDisplayedValue || isinf(yAxis.MaxDisplayedValue))
                yAxis.MaxDisplayedValue = this.getValue(i);
        }
            g.DrawLines(new Pen(this.LineColor, 2), ps);
        g.ResetClippingRegion();
    }
    ProvideAutoScroll(axis) {
        if (this.AutoscrollSubscriptions.Contains(axis))
            return;
        this.AutoscrollSubscriptions.Add(axis);
        axis.DefaultScalingMode = AutoscalingMode.Autoscroll;
    }
}