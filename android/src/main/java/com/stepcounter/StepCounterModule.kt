package com.stepcounter

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = StepCounterModule.NAME)
class StepCounterModule(reactContext: ReactApplicationContext) :
    NativeStepCounterSpec(reactContext) {
    override fun getName(): String {
        return NAME
    }

    companion object {
        const val NAME = "StepCounter"
    }
}