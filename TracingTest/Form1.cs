using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using netDxf;

namespace TracingTest
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }
        protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
        {
            if (keyData == Keys.A || keyData == Keys.S || keyData == Keys.D || keyData == Keys.W && MarkedPoints.Count > 0)
            {
                var p = MarkedPoints.Last();
                if (keyData == Keys.A)
                    p = new PointF(p.X - 1, p.Y);
                else if (keyData == Keys.D)
                    p = new PointF(p.X + 1, p.Y);
                else if (keyData == Keys.S)
                    p = new PointF(p.X, p.Y + 1);
                else if (keyData == Keys.W)
                    p = new PointF(p.X, p.Y - 1);
                MarkedPoints.RemoveAt(MarkedPoints.Count - 1);
                MarkedPoints.Add(p);
            }
            else if (keyData == Keys.Back && MarkedPoints.Count > 0)
            {
                MarkedPoints.RemoveAt(MarkedPoints.Count - 1);
            }
            else if (keyData == Keys.P)
                panRB.Checked = true;
            else if (keyData == Keys.R)
                scaleRB.Checked = true;
            else if (keyData == Keys.Add)
                addPointRB.Checked = true;
            else if (keyData == Keys.Insert)
            {
                StringBuilder sb = new StringBuilder();
                sb.AppendLine("x,y");
                foreach (var p in MarkedPoints)
                {
                    sb.AppendLine(p.X + "," + p.Y);
                }
                File.WriteAllText(DateTime.Now.ToString("hh_mm")+".csv", sb.ToString());
            }

            RedrawPoints();
            return false;
        }
        List<PointF> MarkedPoints = new List<PointF>();
        private void preview_Click(object sender, EventArgs e)
        {
            DxfDocument doc = null;
            if (File.Exists(@"C:\Users\umar.hassan\Desktop\alternatefinal.dxf"))
                doc = netDxf.DxfDocument.Load(@"C:\Users\umar.hassan\Desktop\alternatefinal.dxf");
            else
            {
                OpenFileDialog ofd = new OpenFileDialog();
                ofd.Filter = "DXF Files (*.dxf)|*.dxf|Image Files (*.jpg, *.png, *.bmp)|*.jpg;*.png;*.bmp";
                if (ofd.ShowDialog() != DialogResult.OK)
                    return;
                if (ofd.FileName.ToLower().EndsWith("dxf"))
                {
                    doc = netDxf.DxfDocument.Load(ofd.FileName);
                    var imgDef = doc.ImageDefinitions.ToList()[0];
                    var image = Image.FromFile(imgDef.File);

                    dbPanel1.Data = new Bitmap(image.Width, image.Height);
                    dbPanel1.g = Graphics.FromImage(dbPanel1.Data);

                    dbPanel1.Camera = image;
                    List<PointF> MarkedPoints = new List<PointF>();
                    List<SizeF> sizes = new List<SizeF>();
                    foreach (var spline in doc.Splines)
                    {
                        var userPoly = spline.PolygonalVertexes(30);
                        var points = userPoly.Select(p => new PointF((float)p.X, (float)p.Y)).ToArray();
                        var x = points.Average(p => p.X);
                        var y = points.Average(p => p.Y);
                        MarkedPoints.Add(new PointF(x, y));
                        var xmin = points.Min(p => p.X);
                        var ymin = points.Min(p => p.Y);
                        var xmax = points.Max(p => p.X);
                        var ymax = points.Max(p => p.Y);
                        sizes.Add(new SizeF(xmax - xmin, ymax - ymin));
                    }
                    this.MarkedPoints = MarkedPoints.ToList();
                }
                else
                {
                    var image = Image.FromFile(ofd.FileName);

                    dbPanel1.Data = new Bitmap(image.Width, image.Height);
                    dbPanel1.g = Graphics.FromImage(dbPanel1.Data);

                    dbPanel1.Camera = image;
                }
            }
            RedrawPoints();
        }
        void RedrawPoints()
        {
            dbPanel1.g.Clear(Color.Transparent);
            float sz = 6;
            foreach (var p in MarkedPoints)
            {
                dbPanel1.g.DrawEllipse(new Pen(Color.Black, 3), p.X - sz / 2, p.Y - sz / 2, sz, sz);
                dbPanel1.g.DrawEllipse(Pens.Yellow, p.X - sz / 2, p.Y - sz / 2, sz, sz);
                //dbPanel1.g.DrawString(p.ToString(), dbPanel1.Font, Brushes.Yellow, p.X + sz, p.Y + sz);
            }
            dbPanel1.Invalidate();
        }

        object lastMouseWhileDown = null;
        Point mouseDownAt;
        private void dbPanel1_MouseDown(object sender, MouseEventArgs e)
        {
            if (addPointRB.Checked)
            {
                MarkedPoints.Add(new PointF(
                    e.X - dbPanel1.OffsetXG,
                    e.Y - dbPanel1.OffsetYG
                    ));
                RedrawPoints();
            }
            else
            {
                lastMouseWhileDown = e.Location;
                mouseDownAt = e.Location;
            }
        }

        private void dbPanel1_MouseMove(object sender, MouseEventArgs e)
        {
            if (this.lastMouseWhileDown == null)
                return;
            var lastMouseWhileDown = (Point)(this.lastMouseWhileDown);
            var dx = e.X - lastMouseWhileDown.X;
            var dy = e.Y - lastMouseWhileDown.Y;
            this.lastMouseWhileDown = e.Location;
            if (moveRB.Checked)
            {
                MarkedPoints = MarkedPoints.Select(p => new PointF(p.X + dx, p.Y + dy)).ToList();
                RedrawPoints();
            }
            else if (scaleRB.Checked)
            {
                float s = 1;
                if (dx < 0)
                    s = 0.99F;
                else
                    s = 1.01F;
                float xo = mouseDownAt.X- dbPanel1.OffsetXG, yo = mouseDownAt.Y - dbPanel1.OffsetYG;
                MarkedPoints = MarkedPoints.Select(p => new PointF(
                    (p.X - xo) * s + xo,
                    (p.Y - yo) * s + yo
                    )).ToList();
                RedrawPoints();
            }
            else
            {
                dbPanel1.OffsetXG += dx;
                dbPanel1.OffsetYG += dy;
            }
            dbPanel1.Invalidate();
        }

        private void dbPanel1_MouseUp(object sender, MouseEventArgs e)
        {
            lastMouseWhileDown = null;
        }

        private void export_Click(object sender, EventArgs e)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("x,y");
            foreach (var p in MarkedPoints)
            {
                sb.AppendLine(p.X + "," + p.Y);
            }
            var sfd = new SaveFileDialog();
            sfd.Filter = "Data File (*.csv)|*.csv";
            if (sfd.ShowDialog() == DialogResult.OK)
            {
                File.WriteAllText(sfd.FileName, sb.ToString());
            }
        }
    }
}
