//////////////////////////////////////////////////////////////
////////////////         System     //////////////////////////
//////////////////////////////////////////////////////////////
class Point
{
  constructor(x,y)
  {
    this.X = x;
    this.Y = y;
  }
}
class PointF {
	constructor(x, y) {
		this.X = x;
		this.Y = y;
	}
}
class MouseEventArgs
{
  constructor(x,y)
  {
    this.X = x;
    this.Y = y;
  }
  get Location()
  {
	  return new Point(this.X, this.Y);
  }
}
class EventArgs {
}
class MouseEventHandler
{
	constructor()
	{
		this.subscribers = new List();
	}
	Add(func)
	{
		this.subscribers.Add(func);
	}
	Invoke(s, e)
	{
		for (let i =0; i < this.subscribers.InnerList.length; i++)
			this.subscribers.InnerList[i](s, e);
	}
}
class EventHandler {
	constructor() {
		this.subscribers = new List();
	}
	Add(func) {
		this.subscribers.Add(func);
	}
	Invoke(s, e) {
		for (let i = 0; i < this.subscribers.InnerList.length; i++)
			this.subscribers.InnerList[i](s, e);
	}
}
class Rectangle
{
  constructor(x,y, w, h)
  {
    this.X = x;
    this.Y = y;
    this.Width = w;
    this.Height = h;
  }
  get Location()
  {
	  return new Point(this.X, this.Y);
  }
  get Size()
  {
	  return new Size(this.Width, this.Height);
  }
  get Left()
  {
	  return this.X;
  }
  get Top()
  {
	  return this.Y;
  }
  Contains(x, y)
  {
	return x >= this.Left && y >= this.Top && x <= this.Left + this.Width && y <= this.Top + this.Height;
  }
}
class Size
{
  constructor(w,h)
  {
    this.Width = w;
    this.Height = h;
  }
}
class Pen
{
  constructor(color, thickness)
  {
	  this.Thickness = thickness;
	  this.Color = color;
  }
}

class List
{
	constructor()
	{
		this.InnerList = new Array();
		this.Count = 0;
	}
	ToArray()
	{
		return InnerList;
	}
	Last() {
		return this.InnerList[this.Count - 1];
    }
	Add(value)
	{
		this.InnerList[this.Count] = value;
		this.Count++;
	}
	Contains(value)
	{
		for (let i =0; i < this.Count; i++)
			if (this.InnerList[i] == value)
				return true;
		return false;
	}
	RemoveAt(ind)
	{
		if (ind >= this.Count)
			return;
		for (let i = ind; i < this.Count - 1; i++)
			this.InnerList[i] = this.InnerList[i + 1];
		this.Count --;
	}
	Remove(value)
	{
		var ind = this.IndexOf(value);
		if (ind >= 0)
			this.RemoveAt(ind);
	}
	Clear() {
		this.Count = 0;
	}
	IndexOf(value)
	{
		for (let i = 0; i < this.Count; i++)
			if (this.InnerList[i] == value)
				return i;
		return -1;
	}
	Average()
	{
		var sum = 0;
		for (let i = 0; i < this.Count; i++)
			sum += this.InnerList[i]
		return sum / this.Count;
	}
	Find(func)
	{
		for (let i = 0; i < this.Count; i++)
			if (func(this.InnerList[i]))
				return this.InnerList[i];
		return null;
	}
	Sum(func) {
		var sum = 0;
		for (let i = 0; i < this.Count; i++)
			sum += func(this.InnerList[i]);
		return sum;
	}
}
