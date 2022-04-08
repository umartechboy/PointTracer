using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TracingTest
{
    public class dbPanel:Panel
    {
        public Bitmap Data { get; set; }
        public Image Camera;
        public Graphics g { get; set; }
        public float OffsetXG = 0;
        public float Scale { get; set; } = 1;
        public float OffsetYG = 0;
        public dbPanel()
        {
            DoubleBuffered = true;
            SizeChanged += DbPanel_SizeChanged;
            Data = new Bitmap(Width, Height);
            g = Graphics.FromImage(Data);
        }

        private void DbPanel_SizeChanged(object sender, EventArgs e)
        {
        }
        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            
            if (Camera != null)
                e.Graphics.DrawImage(Camera, OffsetXG, OffsetYG);
            if (Data != null)
                e.Graphics.DrawImage(Data, OffsetXG, OffsetYG);
        }
    }
}
