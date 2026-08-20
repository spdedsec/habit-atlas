package com.habitatlas.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;

/** Android home-screen entry point for the on-device Habit Atlas daily snapshot. */
public class AtlasWidgetProvider extends AppWidgetProvider {
    private static final String STORE = "habit_atlas_widget";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        updateAll(context, manager, appWidgetIds);
    }

    static void updateAll(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        SharedPreferences values = context.getSharedPreferences(STORE, Context.MODE_PRIVATE);
        String title = values.getString("title", "Habit Atlas");
        String subtitle = values.getString("subtitle", "Open your private fieldbook.");
        String progress = values.getString("progress", "—");
        String quickHabitId = values.getString("quickHabitId", "");
        String quickHabitName = values.getString("quickHabitName", "");
        String actionUrl = quickHabitId.isEmpty() ? "habitatlas://today" : "habitatlas://habit/" + quickHabitId + "/complete";

        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_habit_atlas);
            views.setTextViewText(R.id.widget_title, title);
            views.setTextViewText(R.id.widget_subtitle, subtitle);
            views.setTextViewText(R.id.widget_progress, progress);
            views.setTextViewText(R.id.widget_action, quickHabitId.isEmpty() ? "Open today" : "Mark " + quickHabitName);
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent(context, "habitatlas://today", widgetId));
            views.setOnClickPendingIntent(R.id.widget_action, pendingIntent(context, actionUrl, widgetId + 10000));
            manager.updateAppWidget(widgetId, views);
        }
    }

    private static PendingIntent pendingIntent(Context context, String path, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(path));
        return PendingIntent.getActivity(context, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
