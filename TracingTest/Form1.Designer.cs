﻿
namespace TracingTest
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
            this.previewB = new System.Windows.Forms.Button();
            this.panRB = new System.Windows.Forms.RadioButton();
            this.scaleRB = new System.Windows.Forms.RadioButton();
            this.moveRB = new System.Windows.Forms.RadioButton();
            this.exportB = new System.Windows.Forms.Button();
            this.addPointRB = new System.Windows.Forms.RadioButton();
            this.dbPanel1 = new TracingTest.dbPanel();
            this.SuspendLayout();
            // 
            // previewB
            // 
            this.previewB.Location = new System.Drawing.Point(16, 15);
            this.previewB.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.previewB.Name = "previewB";
            this.previewB.Size = new System.Drawing.Size(100, 28);
            this.previewB.TabIndex = 0;
            this.previewB.Text = "Load";
            this.previewB.UseVisualStyleBackColor = true;
            this.previewB.Click += new System.EventHandler(this.preview_Click);
            // 
            // panRB
            // 
            this.panRB.AutoSize = true;
            this.panRB.Checked = true;
            this.panRB.Location = new System.Drawing.Point(16, 50);
            this.panRB.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.panRB.Name = "panRB";
            this.panRB.Size = new System.Drawing.Size(52, 20);
            this.panRB.TabIndex = 0;
            this.panRB.TabStop = true;
            this.panRB.Text = "Pan";
            this.panRB.UseVisualStyleBackColor = true;
            // 
            // scaleRB
            // 
            this.scaleRB.AutoSize = true;
            this.scaleRB.Location = new System.Drawing.Point(16, 164);
            this.scaleRB.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.scaleRB.Name = "scaleRB";
            this.scaleRB.Size = new System.Drawing.Size(70, 20);
            this.scaleRB.TabIndex = 0;
            this.scaleRB.Text = "Resize";
            this.scaleRB.UseVisualStyleBackColor = true;
            // 
            // moveRB
            // 
            this.moveRB.AutoSize = true;
            this.moveRB.Location = new System.Drawing.Point(16, 192);
            this.moveRB.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.moveRB.Name = "moveRB";
            this.moveRB.Size = new System.Drawing.Size(62, 20);
            this.moveRB.TabIndex = 0;
            this.moveRB.Text = "Move";
            this.moveRB.UseVisualStyleBackColor = true;
            // 
            // exportB
            // 
            this.exportB.Location = new System.Drawing.Point(16, 251);
            this.exportB.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.exportB.Name = "exportB";
            this.exportB.Size = new System.Drawing.Size(100, 28);
            this.exportB.TabIndex = 0;
            this.exportB.Text = "Export";
            this.exportB.UseVisualStyleBackColor = true;
            this.exportB.Click += new System.EventHandler(this.export_Click);
            // 
            // addPointRB
            // 
            this.addPointRB.AutoSize = true;
            this.addPointRB.Location = new System.Drawing.Point(16, 220);
            this.addPointRB.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.addPointRB.Name = "addPointRB";
            this.addPointRB.Size = new System.Drawing.Size(86, 20);
            this.addPointRB.TabIndex = 0;
            this.addPointRB.Text = "Add Point";
            this.addPointRB.UseVisualStyleBackColor = true;
            // 
            // dbPanel1
            // 
            this.dbPanel1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.dbPanel1.Data = ((System.Drawing.Bitmap)(resources.GetObject("dbPanel1.Data")));
            this.dbPanel1.Location = new System.Drawing.Point(124, 15);
            this.dbPanel1.Margin = new System.Windows.Forms.Padding(4);
            this.dbPanel1.Name = "dbPanel1";
            this.dbPanel1.Scale = 1F;
            this.dbPanel1.Size = new System.Drawing.Size(1145, 1012);
            this.dbPanel1.TabIndex = 1;
            this.dbPanel1.MouseDown += new System.Windows.Forms.MouseEventHandler(this.dbPanel1_MouseDown);
            this.dbPanel1.MouseMove += new System.Windows.Forms.MouseEventHandler(this.dbPanel1_MouseMove);
            this.dbPanel1.MouseUp += new System.Windows.Forms.MouseEventHandler(this.dbPanel1_MouseUp);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1285, 1041);
            this.Controls.Add(this.addPointRB);
            this.Controls.Add(this.moveRB);
            this.Controls.Add(this.scaleRB);
            this.Controls.Add(this.panRB);
            this.Controls.Add(this.dbPanel1);
            this.Controls.Add(this.exportB);
            this.Controls.Add(this.previewB);
            this.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.Name = "Form1";
            this.Text = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button previewB;
        private System.Windows.Forms.RadioButton panRB;
        private System.Windows.Forms.RadioButton scaleRB;
        private System.Windows.Forms.RadioButton moveRB;
        private System.Windows.Forms.Button exportB;
        private System.Windows.Forms.RadioButton addPointRB;
        private dbPanel dbPanel1;
    }
}

