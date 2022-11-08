namespace DXFOptimizer
{
    partial class form1
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
            this.loadB = new System.Windows.Forms.Button();
            this.treeView1 = new System.Windows.Forms.TreeView();
            this.drawingBoard = new DXFOptimizer.DrawingBoard();
            this.SaveB = new System.Windows.Forms.Button();
            this.saveLinearB = new System.Windows.Forms.Button();
            this.firstOnBottomCB = new System.Windows.Forms.CheckBox();
            this.SuspendLayout();
            // 
            // loadB
            // 
            this.loadB.Location = new System.Drawing.Point(13, 15);
            this.loadB.Margin = new System.Windows.Forms.Padding(4);
            this.loadB.Name = "loadB";
            this.loadB.Size = new System.Drawing.Size(92, 28);
            this.loadB.TabIndex = 1;
            this.loadB.Text = "Load";
            this.loadB.UseVisualStyleBackColor = true;
            this.loadB.Click += new System.EventHandler(this.loadB_Click);
            // 
            // treeView1
            // 
            this.treeView1.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left)));
            this.treeView1.Location = new System.Drawing.Point(2, 124);
            this.treeView1.Name = "treeView1";
            this.treeView1.Size = new System.Drawing.Size(197, 617);
            this.treeView1.TabIndex = 2;
            this.treeView1.AfterSelect += new System.Windows.Forms.TreeViewEventHandler(this.treeView1_AfterSelect);
            this.treeView1.NodeMouseClick += new System.Windows.Forms.TreeNodeMouseClickEventHandler(this.treeView1_NodeMouseClick);
            this.treeView1.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.treeView1_KeyPress);
            // 
            // drawingBoard
            // 
            this.drawingBoard.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.drawingBoard.Location = new System.Drawing.Point(216, 15);
            this.drawingBoard.Margin = new System.Windows.Forms.Padding(4);
            this.drawingBoard.Name = "drawingBoard";
            this.drawingBoard.PPU = 1F;
            this.drawingBoard.Size = new System.Drawing.Size(1053, 726);
            this.drawingBoard.TabIndex = 1;
            this.drawingBoard.MouseClick += new System.Windows.Forms.MouseEventHandler(this.drawingBoard_MouseClick);
            // 
            // SaveB
            // 
            this.SaveB.Location = new System.Drawing.Point(13, 51);
            this.SaveB.Margin = new System.Windows.Forms.Padding(4);
            this.SaveB.Name = "SaveB";
            this.SaveB.Size = new System.Drawing.Size(69, 28);
            this.SaveB.TabIndex = 1;
            this.SaveB.Text = "Save";
            this.SaveB.UseVisualStyleBackColor = true;
            this.SaveB.Click += new System.EventHandler(this.SaveB_Click);
            // 
            // saveLinearB
            // 
            this.saveLinearB.Location = new System.Drawing.Point(13, 89);
            this.saveLinearB.Margin = new System.Windows.Forms.Padding(4);
            this.saveLinearB.Name = "saveLinearB";
            this.saveLinearB.Size = new System.Drawing.Size(92, 28);
            this.saveLinearB.TabIndex = 1;
            this.saveLinearB.Text = "Save Linear";
            this.saveLinearB.UseVisualStyleBackColor = true;
            this.saveLinearB.Click += new System.EventHandler(this.saveLinearB_Click);
            // 
            // firstOnBottomCB
            // 
            this.firstOnBottomCB.AutoSize = true;
            this.firstOnBottomCB.Checked = true;
            this.firstOnBottomCB.CheckState = System.Windows.Forms.CheckState.Checked;
            this.firstOnBottomCB.Location = new System.Drawing.Point(89, 56);
            this.firstOnBottomCB.Name = "firstOnBottomCB";
            this.firstOnBottomCB.Size = new System.Drawing.Size(117, 20);
            this.firstOnBottomCB.TabIndex = 0;
            this.firstOnBottomCB.Text = "First on Bottom";
            this.firstOnBottomCB.UseVisualStyleBackColor = true;
            // 
            // form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1285, 754);
            this.Controls.Add(this.firstOnBottomCB);
            this.Controls.Add(this.treeView1);
            this.Controls.Add(this.saveLinearB);
            this.Controls.Add(this.SaveB);
            this.Controls.Add(this.loadB);
            this.Controls.Add(this.drawingBoard);
            this.Margin = new System.Windows.Forms.Padding(4);
            this.Name = "form1";
            this.Text = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button loadDXFB;
        private DrawingBoard drawingBoard;
        private System.Windows.Forms.Button loadB;
        private System.Windows.Forms.TreeView treeView1;
        private System.Windows.Forms.Button SaveB;
        private System.Windows.Forms.Button saveLinearB;
        private System.Windows.Forms.CheckBox firstOnBottomCB;
    }
}

