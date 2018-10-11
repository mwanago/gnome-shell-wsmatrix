const DefaultWorkspaceSwitcherPopup = imports.ui.workspaceSwitcherPopup;
const WorkspaceThumbnail = imports.ui.workspaceThumbnail;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Main = imports.ui.main;
const Meta  = imports.gi.Meta;

var WorkspaceSwitcherPopup = Lang.Class({
   Name: 'WsMatrixWorkspaceSwitcherPopup',
   Extends: DefaultWorkspaceSwitcherPopup.WorkspaceSwitcherPopup,

   _init: function (rows, columns, scale) {
      // Set rows and columns before calling parent().
      this.rows = rows;
      this.columns = columns;
      this.scale = scale;
      this.parent();
   },

   _getPreferredHeight(actor, forWidth, alloc) {
      let children = this._list.get_children();
      let workArea = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);

      let availHeight = workArea.height;
      availHeight -= this.actor.get_theme_node().get_vertical_padding();
      availHeight -= this._container.get_theme_node().get_vertical_padding();
      availHeight -= this._list.get_theme_node().get_vertical_padding();

      let height = this.rows * this.scale * children[0].get_height();
      let spacing = this._itemSpacing * (this.rows - 1);

      height += spacing;
      height = Math.round(Math.min(height, availHeight));

      this._childHeight = Math.round((height - spacing) / this.rows);

      alloc.min_size = height;
      alloc.natural_size = height;
    },

   _getPreferredWidth(actor, forHeight, alloc) {
      let children = this._list.get_children();
      let workArea = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);

      let availWidth = workArea.width;
      availWidth -= this.actor.get_theme_node().get_horizontal_padding();
      availWidth -= this._container.get_theme_node().get_horizontal_padding();
      availWidth -= this._list.get_theme_node().get_horizontal_padding();

      let width = this.columns * this.scale * children[0].get_width();
      let spacing = this._itemSpacing * (this.columns - 1);

      width += spacing;
      width = Math.round(Math.min(width, availWidth));

      this._childWidth = Math.round((width - spacing) / this.columns);

      alloc.min_size = width;
      alloc.natural_size = width;
    },

   _allocate(actor, box, flags) {
      let children = this._list.get_children();
      let childBox = new Clutter.ActorBox();

      let row = 0;
      let column = 0;
      let itemWidth = this._childWidth + this._itemSpacing;
      let itemHeight = this._childHeight + this._itemSpacing;

      for (let i = 0; i < children.length; i++) {
         row = Math.floor(i / this.columns);
         column = i % this.columns;

         childBox.x1 = Math.round(box.x1 + itemWidth * column);
         childBox.x2 = childBox.x1 + children[i].get_width();
         childBox.y1 = Math.round(box.y1 + itemHeight * row);
         childBox.y2 = childBox.y1 + children[i].get_height();
         children[i].allocate(childBox, flags);
      }
    },

   _redisplay() {
      this._list.destroy_all_children();

      for (let i = 0; i < global.screen.n_workspaces; i++) {
         let workspace = global.screen.get_workspace_by_index(i);
         let thumbnail = new WorkspaceThumbnail.WorkspaceThumbnail(workspace);
         let hScale = this._childWidth / thumbnail.actor.get_width();
         let vScale = this._childHeight / thumbnail.actor.get_height();
         thumbnail.actor.set_scale(hScale, vScale);

         if (i !== this._activeWorkspaceIndex) {
            thumbnail.actor.set_opacity(122);
         }

         this._list.add_actor(thumbnail.actor);
      }

      let workArea = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
      let [containerMinHeight, containerNatHeight] = this._container.get_preferred_height(global.screen_width);
      let [containerMinWidth, containerNatWidth] = this._container.get_preferred_width(containerNatHeight);
      this._container.x = workArea.x + Math.floor((workArea.width - containerNatWidth) / 2);
      this._container.y = workArea.y + Math.floor((workArea.height - containerNatHeight) / 2);
   },
});
