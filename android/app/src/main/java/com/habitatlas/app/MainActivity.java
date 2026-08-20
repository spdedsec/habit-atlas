package com.habitatlas.app;

import com.getcapacitor.BridgeActivity;

/** Registers the local widget bridge alongside Capacitor's standard Android activity. */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(HabitAtlasWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
