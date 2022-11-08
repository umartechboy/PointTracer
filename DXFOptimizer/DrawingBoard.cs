using netDxf;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DXFOptimizer
{
    public class DrawingBoard : Panel
    {
        public float OffsetXG = 0;
        public float OffsetYG = 0;
        public float PPU { get; set; } = 1;
        public DrawingBoard()
        {
            DoubleBuffered = true;
            SizeChanged += DbPanel_SizeChanged;
            MouseMove += dbPanel1_MouseMove;
            MouseDown += dbPanel1_MouseDown;
            MouseUp += dbPanel1_MouseUp;
        }


        private void DbPanel_SizeChanged(object sender, EventArgs e)
        {
        }
        public float XVtoG(float v, float offsetG, float ppu)
        {
            return v * ppu + offsetG;
        }
        public float XGtoV(float vG, float offsetG, float ppu)
        {
            return (vG - offsetG) / ppu;
        }
        public float XGtoV(float vxG)
        {
            return XGtoV(vxG, OffsetXG, PPU);
        }
        public float YVtoG(float v, float offsetG, float ppu)
        {
            return -(v * ppu + offsetG) + (Height - xAxisSize);
        }
        public float YGtoV(float vG, float offsetG, float ppu)
        {
            return (((Height - xAxisSize) - vG) - offsetG) / ppu;
        }
        public float YGtoV(float vyG)
        {
            return YGtoV(vyG, OffsetYG, PPU);
        }
        object lastMouseWhileDown = null;
        bool moveActionIsPan = true;
        float XGAtMouseDown = 0, XVAtMouseDown = 0, YGAtMouseDown = 0, YVAtMouseDown = 0;
        private void dbPanel1_MouseDown(object sender, MouseEventArgs e)
        {
            lastMouseWhileDown = e.Location;
            moveActionIsPan = e.Button == MouseButtons.Left;
            XGAtMouseDown = e.Location.X;
            XVAtMouseDown = XGtoV(e.Location.X);
            YGAtMouseDown = e.Location.Y;
            YVAtMouseDown = YGtoV(e.Location.Y);
            Invalidate();
        }

        PointF MousePositionV;
        private void dbPanel1_MouseMove(object sender, MouseEventArgs e)
        {
            MousePositionV = new PointF(XGtoV(e.Location.X, OffsetXG, PPU), YGtoV(e.Location.Y, OffsetYG, PPU));
            if (this.lastMouseWhileDown == null)
            {
                foreach (var poly in Polygons)
                {
                    poly.Hover = false;
                }
                foreach (var poly in Polygons)
                {
                    if (Form1.IsPointInPolygon(
                        poly.Points.ToArray(),
                        new PointElement() { X = MousePositionV.X, Y = MousePositionV.Y }))
                        poly.Hover = true;
                }
                Invalidate();
                return;
            }

            var lastMouseWhileDown = (Point)(this.lastMouseWhileDown);
            var dx = e.X - lastMouseWhileDown.X;
            var dy = e.Y - lastMouseWhileDown.Y;
            this.lastMouseWhileDown = e.Location;
            if (moveActionIsPan)
            {
                OffsetXG += dx;
                OffsetYG -= dy;
            }
            else
            {
                float changeXG = dx;
                float totalShownV = Width / PPU;
                float changeV = -(changeXG) / PPU;
                float newTotalV = totalShownV + changeV;
                if (newTotalV < 0)
                    return;
                PPU = Width / newTotalV;
                OffsetXG = XGAtMouseDown - XVAtMouseDown * PPU;
                OffsetYG = ((Height - xAxisSize) - YGAtMouseDown) - YVAtMouseDown * PPU;
                Invalidate();
            }
            Invalidate();
        }

        private void dbPanel1_MouseUp(object sender, MouseEventArgs e)
        {
            lastMouseWhileDown = null;
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            var g = e.Graphics;
            g.Clear(BackColor);
            DrawXAxisAndGrid(g);
            DrawYAxisAndGrid(g);
            g.DrawRectangle(Pens.Black, 0,0, Width - yAxisSize, Height - xAxisSize);
            if (Polygons == null)
                return;
            g.SetClip(new RectangleF(0, 0, Width - yAxisSize, Height - xAxisSize));
            object toolAt = null;
            foreach (var polygon in Polygons)
            {
                foreach (var child in polygon.Children)
                {
                    if (child.Selected || polygon.Hover)
                    {
                        g.DrawLines(
                            new Pen(Color.Red, 2),
                            child.Points.Select(p => new PointF(
                            (float)(XVtoG((float)p.X, OffsetXG, PPU)),
                            (float)(YVtoG((float)p.Y, OffsetYG, PPU))
                            )).ToArray());
                        g.DrawLine(
                            new Pen(Color.Blue, 4),
                            (float)(XVtoG((float)child.Points[0].X, OffsetXG, PPU)),
                            (float)(YVtoG((float)child.Points[0].Y, OffsetYG, PPU)),
                            (float)(XVtoG((float)child.Points[1].X, OffsetXG, PPU)),
                            (float)(YVtoG((float)child.Points[1].Y, OffsetYG, PPU))
                            );
                        g.DrawEllipse(
                            new Pen(Color.Blue, 2),
                            new RectangleF(
                            (float)(XVtoG((float)child.Points[0].X, OffsetXG, PPU)) - 5,
                            (float)(YVtoG((float)child.Points[0].Y, OffsetYG, PPU)) - 5,
                            10, 10));
                    }
                    else
                        g.DrawLines(
                            Pens.Black,
                            child.Points.Select(p => new PointF(
                            (float)(XVtoG((float)p.X, OffsetXG, PPU)),
                            (float)(YVtoG((float)p.Y, OffsetYG, PPU))
                            )).ToArray());
                    if (toolAt == null)
                    {
                        if (polygon.Selected)
                            toolAt = polygon.Children.First().Points.Last();
                    }
                    else
                    {
                        var t = (PointElement)toolAt;
                        g.DrawLine(
                            new Pen(Color.DarkCyan, 1),
                            (float)(XVtoG((float)child.Points.First().X, OffsetXG, PPU)),
                            (float)(YVtoG((float)child.Points.First().Y, OffsetYG, PPU)),
                            (float)(XVtoG((float)t.X, OffsetXG, PPU)),
                            (float)(YVtoG((float)t.Y, OffsetYG, PPU))
                            );
                        toolAt = child.Exit();
                    }

                }
                if (polygon.Selected || polygon.Hover)
                {
                    g.DrawLines(
                        new Pen(Color.Red, 2),
                        polygon.Points.Select(p => new PointF(
                        (float)(XVtoG((float)p.X, OffsetXG, PPU)),
                        (float)(YVtoG((float)p.Y, OffsetYG, PPU))
                        )).ToArray());
                    g.DrawLine(
                        new Pen(Color.Blue, 4),
                        (float)(XVtoG((float)polygon.Points[0].X, OffsetXG, PPU)),
                        (float)(YVtoG((float)polygon.Points[0].Y, OffsetYG, PPU)),
                        (float)(XVtoG((float)polygon.Points[1].X, OffsetXG, PPU)),
                        (float)(YVtoG((float)polygon.Points[1].Y, OffsetYG, PPU))
                        );
                    g.DrawEllipse(
                        new Pen(Color.Blue, 2),
                        new RectangleF(
                        (float)(XVtoG((float)polygon.Points[0].X, OffsetXG, PPU)) - 5,
                        (float)(YVtoG((float)polygon.Points[0].Y, OffsetYG, PPU)) - 5,
                        10, 10));
                    if (toolAt != null)
                    {
                        var t = (PointElement)toolAt;
                        g.DrawLine(
                            new Pen(Color.DarkCyan, 1),
                            (float)(XVtoG((float)polygon.Points.First().X, OffsetXG, PPU)),
                            (float)(YVtoG((float)polygon.Points.First().Y, OffsetYG, PPU)),
                            (float)(XVtoG((float)t.X, OffsetXG, PPU)),
                            (float)(YVtoG((float)t.Y, OffsetYG, PPU))
                            );
                    }
                }
                else
                    g.DrawLines(
                        Pens.Black,
                        polygon.Points.Select(p => new PointF(
                        (float)(XVtoG((float)p.X, OffsetXG, PPU)),
                        (float)(YVtoG((float)p.Y, OffsetYG, PPU))
                        )).ToArray());
                toolAt = null;
            }
            g.DrawString(MousePositionV.ToString(), Font, Brushes.Black, 2, 2);
        }
        
        public List<Polygon> Polygons { get; private set; } = new List<Polygon>();
        internal void Feed(List<Polygon> elements)
        {
            this.Polygons.AddRange(elements);
            Invalidate();
        }
        int SignificantFiguresAfterDecimal = 3;
        string FormatNumber(double d)
        {
            return d.ToString("F" + SignificantFiguresAfterDecimal);
        }
        float xAxisSize = 40, yAxisSize = 80;
        public void DrawXAxisAndGrid(Graphics g)
        {
            var tickFont = Font;
            RectangleF PlotBounds = new RectangleF(0, 0, Width - yAxisSize, Height - 40);
            RectangleF AxisBounds = new RectangleF(0, PlotBounds.Height, PlotBounds.Width, Height - PlotBounds.Height);

            Color axisColor = Color.Blue;
            Color axisMajorLines = Color.LightGray;
            Color axisMinorLines = Color.LightGray;

            float xs = PPU;
            float xog = OffsetXG;
            // X Axis
            var axisP = new Pen(axisColor, 1.5F);
            var majLine = new Pen(axisMajorLines, 1F);
            var minLine = new Pen(axisMinorLines, 1F);

            double unitX = 1 / Math.Pow(10, SignificantFiguresAfterDecimal);
            double multF = 5;
            // determine scale first
            float testValue = 123.123456F;
            FormatNumber(testValue);
            var testSz = g.MeasureString(FormatNumber(testValue), tickFont);
            while (unitX * xs < testSz.Width * 1.5F)
            {
                unitX *= multF;
                multF = multF == 2 ? 5 : 2;
            }

            double minX = 0, maxX = 0;
            while (minX * xs < -xog)
            {
                if (double.IsPositiveInfinity(minX + unitX))
                { minX = float.MaxValue; break; }
                minX += unitX;
            }
            while (minX * xs > -xog)
            {
                if (double.IsNegativeInfinity(minX - unitX))
                { minX = double.MinValue; break; }
                minX -= unitX;
            }

            while (maxX * xs > PlotBounds.Width - xog)
            {
                if (double.IsNegativeInfinity(maxX - unitX))
                { minX = double.MinValue; break; }
                maxX -= unitX;
            }
            while (maxX * xs < PlotBounds.Width - xog)
            {
                if (double.IsPositiveInfinity(maxX + unitX))
                { maxX = float.MaxValue; break; }
                maxX += unitX;
            }



            int xaHei = (tickFont.Height * 15 / 10);
            bool isMinLine = false;

            var xSigFiguresAfterD = 0;
            var totalFigs = (unitX / 2 - Math.Floor(unitX / 2)).ToString().Length - 2;

            while (Math.Round(unitX, xSigFiguresAfterD) == Math.Round(unitX / 2, xSigFiguresAfterD)
                && xSigFiguresAfterD <= totalFigs)
                xSigFiguresAfterD++;

            for (double i = minX; i <= maxX; i += unitX / 2)
            {
                //PointF drawableMid = VtoG(new PointF(i, 0), xog / xs, xs, 1, 0);
                //drawableMid = new PointF(drawableMid.X, h);

                PointF drawable1 = new PointF((float)i * xs + xog + PlotBounds.X, PlotBounds.Y);
                PointF drawable2 = new PointF((float)i * xs + xog + PlotBounds.X, PlotBounds.Y + PlotBounds.Height);
                //if (grid)
                //drawable1 = new PointF(drawable1.X, 0);
                //if (grid)
                //drawable2 = new PointF(drawable2.X, h - xaHei);

                var s = FormatNumber((float)i);
                var xyo = g.MeasureString(s, tickFont);
                PointF drawableStrPos = new PointF(drawable2.X - xyo.Width / 2, AxisBounds.Y + 8);
                if (!isMinLine)
                {
                    drawable2 = new PointF((float)i * xs + xog + PlotBounds.X, PlotBounds.Y + PlotBounds.Height + 5);
                    if (drawable1.X < PlotBounds.Width && drawable1.X >= 0)
                    {
                        g.DrawLine(majLine, drawable1, drawable2);
                        g.DrawString(s, tickFont,new SolidBrush(Color.Gray), drawableStrPos.X, drawableStrPos.Y);
                    }
                }
                else
                {
                    if (drawable1.X < PlotBounds.Width && drawable1.X > 0)
                    {
                        g.DrawLine(minLine, drawable1, drawable2);
                    }
                }
                isMinLine = !isMinLine;
            }
            if (xog < PlotBounds.Width && xog > 0)
                g.DrawLine(axisP, xog, 0, xog, PlotBounds.Height);

            //g.DrawLine(axisP, AxisBounds.X, AxisBounds.Y, AxisBounds.X + AxisBounds.Width, AxisBounds.Y);

            //// axis labels are buttons now. Dont draw their strings
            //var unitStr = new DXString(ThemedResources) { Text = Unit, Color = Color.Black, DXFont = tickFont };
            //var unitSize = g.MeasureString(unitStr);
            //g.DrawString(unitStr, AxisBounds.X + AxisBounds.Width / 2 - unitSize.Width / 2, AxisBounds.Y + tickFont.Height * 0.9F);
        }

        public void DrawYAxisAndGrid(Graphics g)
        {
            var tickFont = Font;
            RectangleF PlotBounds = new RectangleF(0, 0, Width - yAxisSize, Height - xAxisSize);
            RectangleF AxisBounds = new RectangleF(PlotBounds.Width, 0, Width - PlotBounds.Width, Height - xAxisSize);
            Color axisColor = Color.Blue;
            Color axisMajorLines = Color.LightGray;
            Color axisMinorLines = Color.LightGray;

            var st = DateTime.Now;
            float ys = PPU;
            float yog = OffsetYG;

            // X Axis
            var axisP = new Pen(axisColor, 1.5F);
            var majLine = new Pen(axisMajorLines, 1F);
            var minLine = new Pen(axisMinorLines, 1F);

            // Y Axis
            double unitY = 1e-6;
            double multF = 5;
            multF = 5;
            int iterations = 0;
            // determine scale first
            while (unitY * ys < tickFont.Height * 1.5F)
            {
                if (double.IsNegativeInfinity(unitY * multF))
                { unitY = double.MinValue; break; }
                if (double.IsPositiveInfinity(unitY * multF))
                { unitY = double.MaxValue; break; }
                unitY *= multF;
                multF = multF == 2 ? 5 : 2;
                if (unitY < 1e-6)
                    break;
            }
            var bm0 = (DateTime.Now - st).TotalMilliseconds;
            //if (unitY < 1e-7 || unitY > 1e7)
            //    return drawingRect;

            double minY = (int)Math.Round(-yog / ys) * unitY, maxY = (int)Math.Round((AxisBounds.Height - yog) / ys) * unitY;
            while (minY * ys < -yog)
            {
                if (double.IsPositiveInfinity(minY + unitY))
                { minY = double.MaxValue; break; }
                minY += unitY;
            }
            var bm1 = (DateTime.Now - st).TotalMilliseconds;
            if (bm1 > 1)
                ;
            while (minY * ys + yog > 0)
            {
                if (double.IsNegativeInfinity(minY - unitY))
                { minY = double.MinValue; break; }
                minY -= unitY;
            }

            while (maxY * ys + yog > AxisBounds.Height)
            {
                if (double.IsNegativeInfinity(maxY - unitY))
                { minY = double.MinValue; break; }
                maxY -= unitY;
            }
            var bm2 = (DateTime.Now - st).TotalMilliseconds;

            if (bm2 > 1)
                ;
            while (maxY * ys + yog < AxisBounds.Height)
            {
                if (double.IsPositiveInfinity(maxY + unitY))
                { maxY = double.MaxValue; break; }
                maxY += unitY;
            }

            var bm3 = (DateTime.Now - st).TotalMilliseconds;

            if (bm3 > 1)
                ;
            bool isMinLine = false;
            var ySigFiguresAfterD = 0;
            var totalFigs = (unitY / 2 - Math.Floor(unitY / 2)).ToString().Length - 2;

            while (Math.Round(unitY, ySigFiguresAfterD) == Math.Round(unitY / 2, ySigFiguresAfterD)
                && ySigFiguresAfterD <= totalFigs)
                ySigFiguresAfterD++;
            for (double i = minY; i <= maxY; i += unitY / 2)
            {
                //PointF drawableMid = VtoG(new PointF(0, i), 1, 1, yog / ys, ys, PlotBounds.Height);
                //drawableMid = new PointF(PlotBounds.Width, drawableMid.Y);

                PointF drawable1 = new PointF(PlotBounds.X, (float)PlotBounds.Height - (float)(PlotBounds.Y + i * ys + yog));
                PointF drawable2 = new PointF(PlotBounds.X + PlotBounds.Width, (float)PlotBounds.Height - (float)(PlotBounds.Y + i * ys + yog));
                if (!isMinLine)
                {
                    drawable2 = new PointF(PlotBounds.X + PlotBounds.Width + 5, (float)PlotBounds.Height - (float)(PlotBounds.Y + i * ys + yog));

                    var s = FormatNumber((float)i);
                    var xyo = g.MeasureString(s, tickFont);
                    PointF drawableStrPos = new PointF(AxisBounds.X + 6, drawable2.Y - xyo.Height / 2);
                    if (drawable2.Y < PlotBounds.Y + PlotBounds.Height && drawable2.Y > PlotBounds.Y)
                    {
                        g.DrawLine(majLine, drawable1, drawable2);
                        g.DrawString(s, tickFont, new SolidBrush(Color.Gray), drawableStrPos.X, drawableStrPos.Y);

                    }
                }
                else
                {
                    if (drawable2.Y < PlotBounds.Height && drawable2.Y > 0)
                        g.DrawLine(minLine, drawable1, drawable2);
                }
                isMinLine = !isMinLine;
            }

            // zero line
            if (yog < AxisBounds.Height && yog > 0)
                g.DrawLine(axisP, PlotBounds.X, PlotBounds.Y + PlotBounds.Height - yog, PlotBounds.X + PlotBounds.Width, PlotBounds.Y + PlotBounds.Height - yog);

            var bm4 = (DateTime.Now - st).TotalMilliseconds;
            if (bm4 > 2)
                ;
            // draw border
            //g.DrawLine(axisP, AxisBounds.X, AxisBounds.Y, AxisBounds.X, AxisBounds.Y + AxisBounds.Height);

            // axis labels are buttons now. Dont draw their strings
            //var unitStr = new DXString(ThemedResources) { Text = Unit, Color = Color.Black, DXFont = Font };
            //var unitSize = g.MeasureString(unitStr);

            //g.DrawString(unitStr, AxisBounds.X + Font.Height * 2.5F, AxisBounds.Y + AxisBounds.Height/2 + unitSize.Width/2, -90);
        }
    }
}