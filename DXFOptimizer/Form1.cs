using netDxf;
using netDxf.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Xml.Linq;

namespace DXFOptimizer
{
    public partial class form1 : Form
    {
        private DxfDocument doc;

        public form1()
        {
            InitializeComponent();
        }

        private void loadB_Click(object sender, EventArgs e)
        {
            OpenFileDialog ofd = new OpenFileDialog();
            ofd.Filter = "DXF Files (*.dxf)|*.dxf";
            if (ofd.ShowDialog() != DialogResult.OK)
                return;
            doc = netDxf.DxfDocument.Load(ofd.FileName); ;
            var blocks = doc.Blocks.ToList();
            var layers = doc.Layers.ToList();
            var elements = new List<Polygon>();
            foreach (var block in blocks)
            {
                var entities = block.Entities.ToList();
                foreach (var entity in entities)
                {
                    if (entity is netDxf.Entities.LwPolyline)
                    {
                        var poly = (netDxf.Entities.LwPolyline)entity;
                        elements.Add(poly);
                        elements.Last().Name = entity.Layer.Name;
                    }
                    else if (entity is netDxf.Entities.Insert)
                    {

                    }
                    else if (entity is netDxf.Entities.Spline)
                    {
                        var poly = (netDxf.Entities.Spline)entity;
                        var polyL = poly.ToPolyline(100);
                        var xsz = polyL.Vertexes.Max(v => v.Position.X) - polyL.Vertexes.Min(v => v.Position.X);
                        var ysz = polyL.Vertexes.Max(v => v.Position.Y) - polyL.Vertexes.Min(v => v.Position.Y);
                        var perimeter = xsz * 2 + ysz * 2;
                        var res = 0.5;
                        var parts = perimeter / res + 4;
                        elements.Add(poly.ToPolyline((int)parts));
                        elements.Last().Name = entity.Layer.Name;
                    }
                    else
                    {

                    }
                }
                var xdata = block.XData.ToList();
            }
            // First, move all points to positive coordinates
            var minX = elements.Min(elem => elem.Points.Min(p => p.X));
            var minY = elements.Min(elem => elem.Points.Min(p => p.Y));
            foreach (var elem in elements)
            {
                foreach (var p in elem.Points)
                {
                    p.X -= minX;
                    p.Y -= minY;
                }
            }
            // lets see if some curves can be joined
            // make groups first

            string currentGroupName = "";
            var nameGroup = new List<Polygon>();
            foreach (var elem in elements)
            {
                if (currentGroupName == "")
                    currentGroupName = elem.Name;
                if (elem.Name == currentGroupName)
                {
                    nameGroup.Add(elem);
                    if (elements.Last() != elem) // exception on the last entry
                        continue;
                }
                // lets see if polys in this group can be joined
                bool atleast1Addition = false;
                do
                {
                    atleast1Addition = false;
                    foreach (var poly in nameGroup)
                    {
                        foreach (var existing in nameGroup)
                        {
                            if (poly == existing)
                                continue;
                            if (existing.Points.Count == 0)
                                continue;
                            if (poly.Points.Count == 0)
                                continue;
                            var pe1 = existing.Points[0];
                            var pe2 = existing.Points.Last();

                            var pn1 = poly.Points[0];
                            var pn2 = poly.Points.Last();


                            if (dist(pe1, pn1) < 0.001)
                            {
                                // add before existing in reverse order
                                for (int i = 0; i < poly.Points.Count - 1; i++)
                                    existing.Points.Insert(0, poly.Points[i + 1]);
                                poly.Points.Clear();
                                atleast1Addition = true;
                                break;
                            }
                            else if (dist(pe2, pn1) < 0.001)
                            {
                                // add after existing
                                for (int i = 1; i < poly.Points.Count; i++)
                                    existing.Points.Add(poly.Points[i]);
                                poly.Points.Clear();
                                atleast1Addition = true;
                                break;
                            }
                            else if (dist(pe1, pn2) < 0.001)
                            {
                                // add before existing
                                for (int i = 0; i < poly.Points.Count - 1; i++)
                                    existing.Points.Insert(i, poly.Points[i]);
                                poly.Points.Clear();
                                atleast1Addition = true;
                                break;
                            }
                            else if (dist(pe2, pn2) < 0.001)
                            {
                                // add after existing in reverse order
                                for (int i = 1; i < poly.Points.Count; i++)
                                    existing.Points.Add(poly.Points[poly.Points.Count - 1 - i]);
                                poly.Points.Clear();
                                atleast1Addition = true;
                                break;
                            }
                        }
                    }
                } while (atleast1Addition);
                currentGroupName = elem.Name;
                nameGroup.Clear();
                nameGroup.Add(elem);
            }

            elements = elements.FindAll(elem => elem.Points.Count > 0);
            // we are done joining curves here.
            // Lets find out true object groups.

            // lets see if polys in this group can be joined
            currentGroupName = "";
            nameGroup = new List<Polygon>();
            var childrenList = new List<Polygon>();
            foreach (var elem in elements)
            {
                if (currentGroupName == "")
                    currentGroupName = elem.Name;
                if (elem.Name == currentGroupName)
                {
                    nameGroup.Add(elem);
                    if (elements.Last() != elem) // exception on the last entry
                        continue;
                }
                // find polys and add 
                foreach (var probableParent in nameGroup)
                {
                    foreach (var probableChild in nameGroup)
                    {
                        if (probableChild == probableParent)
                            continue;
                        if (detectSubPoly(probableChild, probableParent))
                        {
                            probableParent.Children.Add(probableChild);
                            childrenList.Add(probableChild);
                        }
                    }
                }
                currentGroupName = elem.Name;
                nameGroup.Clear();
                nameGroup.Add(elem);
            }
            foreach (var child in childrenList)
                elements.Remove(child);

            // So we now have all the objects with joined curves, grouped with their children.
            // Lets Optimize the path on children first.
            // we start at 0,0
            PointElement ToolAt = new PointElement();
            List<Polygon> sortedPolygons = new List<Polygon>();

            while (elements.Count > 0)
            {
                Polygon nearestPolygon = null;
                double minDistance = double.MaxValue;
                foreach (var elem in elements)
                {
                    // find the nearest object
                    var distance = dist(ToolAt, elem.Entry(ToolAt));
                    if (distance < minDistance)
                    {
                        minDistance = distance;
                        nearestPolygon = elem;
                    }
                }
                sortedPolygons.Add(nearestPolygon);
                elements.Remove(nearestPolygon);
                // sort the children of
                nearestPolygon.SortInternally(ToolAt);
                ToolAt = nearestPolygon.Exit();
            }
            elements = sortedPolygons;

            // elements now contain only top level items
            foreach (var elem in elements)
            {
                var pNode = new PolygonGroupTreeNode(elem.Name);
                treeView1.Nodes.Add(pNode);
                foreach (var child in elem.Children)
                    pNode.Nodes.Add(new PolygonTreeNode(child));
                pNode.Nodes.Add(new PolygonTreeNode(elem));
            }
            drawingBoard.Feed(elements);
        }
        double dist (PointElement p1, PointElement p2)
        {
            return Math.Sqrt(Math.Pow(p1.X - p2.X, 2) + Math.Pow(p1.Y - p2.Y, 2));
        }

        /// <summary>
        /// Tells if Poly 1 has at least 1 vertex inside Poly 2
        /// </summary>
        /// <param name="poly1"></param>
        /// <param name="poly2"></param>
        /// <returns></returns>
        bool detectSubPoly(Polygon poly1, Polygon poly2)
        {
            foreach (var p1 in poly1.Points)
            {
                if (IsPointInPolygon(poly2.Points.ToArray(), p1))
                    return true;
            }
            return false;
        }
        /// <summary>
        /// Determines if the given point is inside the polygon
        /// </summary>
        /// <param name="polygon">the vertices of polygon</param>
        /// <param name="testPoint">the given point</param>
        /// <returns>true if the point is inside the polygon; otherwise, false</returns>
        public static bool IsPointInPolygon(PointElement[] polygon, PointElement testPoint)
        {
            bool result = false;
            int j = polygon.Count() - 1;
            for (int i = 0; i < polygon.Count(); i++)
            {
                if (polygon[i].Y < testPoint.Y && polygon[j].Y >= testPoint.Y || polygon[j].Y < testPoint.Y && polygon[i].Y >= testPoint.Y)
                {
                    if (polygon[i].X + (testPoint.Y - polygon[i].Y) / (polygon[j].Y - polygon[i].Y) * (polygon[j].X - polygon[i].X) < testPoint.X)
                    {
                        result = !result;
                    }
                }
                j = i;
            }
            return result;
        }
        private void treeView1_NodeMouseClick(object sender, TreeNodeMouseClickEventArgs e)
        {
            foreach(PolygonGroupTreeNode node in treeView1.Nodes)
            {
                foreach (PolygonTreeNode n in node.Nodes)
                    n.Polygon.Selected = false;
            }
            if (e.Node is PolygonGroupTreeNode)
            {
                var node = (PolygonGroupTreeNode)e.Node;
                foreach (var n in node.Nodes)
                    ((PolygonTreeNode)n).Polygon.Selected = true;
            }
            else
            {
                var node = (PolygonTreeNode)e.Node;
                node.Polygon.Selected = true;
            }
            drawingBoard.Invalidate();
        }

        private void treeView1_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (treeView1.SelectedNode == null)
                return;
            treeView1_NodeMouseClick(sender, new TreeNodeMouseClickEventArgs(treeView1.SelectedNode, MouseButtons.Left, 1, 0, 0));

        }

        private void treeView1_AfterSelect(object sender, TreeViewEventArgs e)
        {
            if (treeView1.SelectedNode == null)
                return;
            treeView1_NodeMouseClick(sender, new TreeNodeMouseClickEventArgs(treeView1.SelectedNode, MouseButtons.Left, 1, 0, 0));

        }

        private void drawingBoard_MouseClick(object sender, MouseEventArgs e)
        {
            var hover = drawingBoard.Polygons.Find(p => p.Hover);
            treeView1.SelectedNode =
                treeView1.Nodes.OfType<PolygonGroupTreeNode>().ToList().Find(n => ((PolygonTreeNode)n.Nodes[n.Nodes.Count - 1]).Polygon == hover);
        }

        private void SaveB_Click(object sender, EventArgs e)
        {
            var sfd = new SaveFileDialog();
            sfd.Filter = "DXF Files (*.dxf)|*.dxf";
            if (sfd.ShowDialog() != DialogResult.OK)
                return;

            var doc = new DxfDocument();

            var polys = treeView1.Nodes.OfType<PolygonGroupTreeNode>();
            if (firstOnBottomCB.Checked) 
                polys = polys.Reverse();
            foreach (PolygonGroupTreeNode node in polys)
            {
                var layer = doc.Layers.Add(new netDxf.Tables.Layer(node.Text));
                foreach(PolygonTreeNode eNode in node.Nodes)
                {
                    var line = new Polyline();
                    foreach (var point in eNode.Polygon.Points)
                        line.Vertexes.Add(new PolylineVertex(point.X, point.Y, 0));
                    line.Layer = layer;
                    line.Color = (node.Nodes.IndexOf(eNode) == node.Nodes.Count - 1) ? AciColor.Blue : AciColor.Red;
                    doc.AddEntity(line);
                }
            }
            doc.Save(sfd.FileName);
        }

        private void saveLinearB_Click(object sender, EventArgs e)
        {
            var sfd = new SaveFileDialog();
            sfd.Filter = "DXF Files (*.dxf)|*.dxf";
            if (sfd.ShowDialog() != DialogResult.OK)
                return;

            var doc = new DxfDocument();

            var polys = treeView1.Nodes.OfType<PolygonGroupTreeNode>();
            polys = polys.Reverse();
            foreach (PolygonGroupTreeNode node in polys)
            {
                var layer = doc.Layers.Add(new netDxf.Tables.Layer(node.Text));
                foreach (PolygonTreeNode eNode in node.Nodes)
                {
                    var line = new Polyline();
                    foreach (var point in eNode.Polygon.Points)
                        line.Vertexes.Add(new PolylineVertex(point.X, point.Y, 0));
                    line.Layer = layer;
                    line.Color = (node.Nodes.IndexOf(eNode) == node.Nodes.Count - 1) ? AciColor.Blue : AciColor.Red;
                    doc.AddEntity(line);
                }
            }
            doc.Save(sfd.FileName);
        }
    }
    public class PointElement
    {
        public double X { get; set; }
        public double Y { get; set; }
        public static implicit operator PointElement(netDxf.Entities.LwPolylineVertex vert)
        {
            return new PointElement() { X = vert.Position.X, Y = vert.Position.Y };
        }
        public static implicit operator PointElement(netDxf.Entities.PolylineVertex vert)
        {
            return new PointElement() { X = vert.Position.X, Y = vert.Position.Y };
        }
        public override string ToString()
        {
            return $"[{X},{Y}]";
        }
    }
    public class Polygon
    {
        public string Name { get; set; }
        public List<PointElement> Points { get; set; }
        public List<Polygon> Children { get; set; } = new List<Polygon>();
        public bool Selected { get; internal set; }
        public bool Hover { get; internal set; }

        public static implicit operator Polygon(netDxf.Entities.LwPolyline line)
        {
            return new Polygon() { Points = line.Vertexes.Select(v => (PointElement)v).ToList() };

        }
        public static implicit operator Polygon(netDxf.Entities.Polyline line)
        {
            return new Polygon() { Points = line.Vertexes.Select(v => (PointElement)v).ToList() };

        }
        public PointElement Entry(PointElement toolEntryAt)
        {
            if (Children.Count == 0)
            {
                var points = Points.ToList();

                while (points.Count > 0)
                {
                    PointElement nearestPoint = null;
                    double minDistance = double.MaxValue;
                    foreach (var point in points)
                    {
                        // find the nearest object
                        var distance = dist(toolEntryAt, point);
                        if (distance < minDistance)
                        {
                            minDistance = distance;
                            nearestPoint = point;
                        }
                    }
                    return nearestPoint;
                }
                return Points[0];
            }

            // find the nearest child

            if (dist(Points.First(), Points.Last()) > 0.001) // open loop. can't reorganise points
            {
                if (dist(toolEntryAt, Points.First()) < dist(toolEntryAt, Points.Last()))
                    return Points.First();
                else
                    return Points.Last();
            }
            else
            {

                List<Polygon> sortedPolygons = new List<Polygon>();

                var elements = Children.ToList();
                while (elements.Count > 0)
                {
                    Polygon nearestPolygon = null;
                    double minDistance = double.MaxValue;
                    foreach (var elem in elements)
                    {
                        // find the nearest object
                        var distance = dist(toolEntryAt, elem.Entry(toolEntryAt));
                        if (distance < minDistance)
                        {
                            minDistance = distance;
                            nearestPolygon = elem;
                        }
                    }
                    return nearestPolygon.Entry(toolEntryAt);
                }
            }
            return Points[0];
        }
        double dist(PointElement p1, PointElement p2)
        {
            return Math.Sqrt(Math.Pow(p1.X - p2.X, 2) + Math.Pow(p1.Y - p2.Y, 2));
        }
        public PointElement Exit()
        {
            return Points.Last();
        }
        public override string ToString()
        {
            return $"{Name} [{Points.Count}]";
        }

        internal void SortInternally(PointElement toolAt)
        {
            if (Children.Count > 0)
            {
                // So we now have all the objects with joined curves, grouped with their children.
                // Lets Optimize the path on children first.
                // we start at 0,0
                List<Polygon> sortedPolygons = new List<Polygon>();

                var elements = Children.ToList();
                while (elements.Count > 0)
                {
                    Polygon nearestPolygon = null;
                    double minDistance = double.MaxValue;
                    foreach (var elem in elements)
                    {
                        // find the nearest object
                        var distance = dist(toolAt, elem.Entry(toolAt));
                        if (distance < minDistance)
                        {
                            minDistance = distance;
                            nearestPolygon = elem;
                        }
                    }
                    sortedPolygons.Add(nearestPolygon);
                    elements.Remove(nearestPolygon);
                    // sort the children of
                    nearestPolygon.SortInternally(toolAt);
                    toolAt = nearestPolygon.Exit();
                }
                Children = sortedPolygons;
            }
            // sort vertices
            // find the nearest vertex to the tool

            if (dist(Points.First(), Points.Last()) > 0.001) // open loop. can't reorganise points
            {
                // the best we can do is reverse the sequence
                if (dist(toolAt, Points.First()) > dist(toolAt, Points.Last()))
                    Points.Reverse();
            }
            else
            {
                var points = Points.ToList();

                PointElement nearestPoint = points[0];
                double minDistance2 = double.MaxValue;
                foreach (var point in points)
                {
                    // find the nearest object
                    var distance = dist(toolAt, point);
                    if (distance < minDistance2)
                    {
                        minDistance2 = distance;
                        nearestPoint = point;
                    }
                }
                // found the nearest point. this must become the first in sequence
                if (Points.IndexOf(nearestPoint) == 0 || Points.IndexOf(nearestPoint) == Points.Count - 1)
                    return;
                Points.RemoveAt(Points.Count - 1);
                var before = Points.IndexOf(nearestPoint);
                var afterRegion = Points.GetRange(0, before);
                var firstRegion = Points.GetRange(before, Points.Count - before);
                Points.Clear();
                Points.AddRange(firstRegion);
                Points.AddRange(afterRegion);
                Points.Add(new PointElement() { X = Points[0].X, Y = Points[0].Y });
            }
        }
    }
    public class PolygonGroupTreeNode : TreeNode
    {
        public string GroupName { get { return Text; } set { Text = value; } }
        public PolygonGroupTreeNode(string name)
        {
            GroupName = name;
        }
    }
    public class PolygonTreeNode : TreeNode
    {
        public Polygon Polygon { get; set; }
        public PolygonTreeNode(Polygon polygon)
        {
            Polygon = polygon;
            Text = polygon.Points.Count.ToString();
        }
    }
}
