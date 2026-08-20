package com.habitatlas.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Minimal app-private bridge. The widget snapshot is derived from IndexedDB and never leaves the device. */
@CapacitorPlugin(name = "HabitAtlasWidget")
public class HabitAtlasWidgetPlugin extends Plugin {
    private static final String STORE = "habit_atlas_widget";

    @PluginMethod
    public void updateSnapshot(PluginCall call) {
        Context context = getContext();
        SharedPreferences preferences = context.getSharedPreferences(STORE, Context.MODE_PRIVATE);
        preferences.edit()
            .putString("title", call.getString("title", "Habit Atlas"))
            .putString("subtitle", call.getString("subtitle", "Open your private fieldbook."))
            .putString("progress", call.getString("progress", "—"))
            .putString("quickHabitId", call.getString("quickHabitId", ""))
            .putString("quickHabitName", call.getString("quickHabitName", ""))
            .apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, AtlasWidgetProvider.class);
        AtlasWidgetProvider.updateAll(context, manager, manager.getAppWidgetIds(provider));
        call.resolve();
    }
}
