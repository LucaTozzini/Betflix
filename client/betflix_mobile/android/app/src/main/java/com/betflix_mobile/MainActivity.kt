package com.betflix_mobile

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * For react-native-google-cast
 */
import androidx.annotation.Nullable;
import com.google.android.gms.cast.framework.CastContext;


/**
 * For react router and react-native-google-cast
 */
import android.os.Bundle;

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "betflix_mobile"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * For react router and react-native-google-cast
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)

    /** Initialize CastContext for Google Cast */
    try {
        /** Lazy load Google Cast context */
        CastContext.getSharedInstance(this)
    } catch (e: Exception) {
        /** Cast framework not supported */
        e.printStackTrace()
    }
  }

}
