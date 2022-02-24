import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import * as FacebookAds from 'expo-ads-facebook';
import * as LocalAuthentication from 'expo-local-authentication';

export default function App() {
    let [isLoaded, setIsLoaded] = React.useState(false);

    FacebookAds.AdSettings.requestPermissionsAsync().then((permission) => {
        let canTrack = permission.status === 'granted';
        FacebookAds.AdSettings.setAdvertiserTrackingEnabled(canTrack);
        FacebookAds.AdSettings.setLogLevel(__DEV__ ? 'debug' : 'none');
        setIsLoaded(true);
    });

    function getPlacementId(type) {

        let placementId;
        const ANDROID_BANNER_ID = '818095215450672_1014730152453843';
        const IOS_BANNER_ID = '818095215450672_1014720585788133';
        const ANDROID_INTERSTITIAL_ID = '818095215450672_1014730259120499';
        const IOS_INTERSTITIAL_ID = '818095215450672_1014720349121490';

        if (type === 'interstitial') {
            placementId = Platform.OS === 'ios' ? IOS_INTERSTITIAL_ID : ANDROID_INTERSTITIAL_ID;

        } else if (type === 'banner') {
            placementId = Platform.OS === 'ios' ? IOS_BANNER_ID : ANDROID_BANNER_ID;
        }

        if (__DEV__) { return `IMG_16_9_APP_INSTALL#${placementId}` }

        return placementId;
    }

    function showInterstitial() {
        if (isLoaded) {
            let placementId = getPlacementId('interstitial');

            FacebookAds.InterstitialAdManager.showAd(placementId)
                .then(c => { console.log(c) })
                .catch(e => { console.log(e) })
        }
    }

    function showBanner() {
        if (isLoaded) {
            let placementId = getPlacementId('banner');

            return (
                <FacebookAds.BannerAd
                    placementId={placementId}
                    type="large"
                    onPress={c => console.log(c)}
                    onError={e => console.log(e)}
                />
            );
        }
    }



    const [facialRecognitionAvailable, setFacialRecognitionAvailable] = React.useState(false);
    const [fingerprintAvailable, setFingerprintAvailable] = React.useState(false);
    const [irisAvailable, setIrisAvailable] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState(false);

    const checkSupportedAuthentication = async () => {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types && types.length) {
            setFacialRecognitionAvailable(types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION));
            setFingerprintAvailable(types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT));
            setIrisAvailable(types.includes(LocalAuthentication.AuthenticationType.IRIS));
        }
    };

    const authenticate = async () => {
        if (loading) {
            return;
        }

        setLoading(true);

        try {
            const results = await LocalAuthentication.authenticateAsync();

            if (results.success) {
                setResult("SUCCESS");
            } else if (results.error === 'unknown') {
                setResult("DISABLED");
            } else if (
                results.error === 'user_cancel' ||
                results.error === 'system_cancel' ||
                results.error === 'app_cancel'
            ) {
                setResult("CANCELLED");
            }
        } catch (error) {
            setResult("ERROR");
        }

        setLoading(false);
    };

    const logout = async () => {
        setResult(false);
    };

    React.useEffect(() => {
        checkSupportedAuthentication();
    }, []);

    let resultMessage;
    switch (result) {
        case "CANCELLED":
            resultMessage = 'Authentication process has been cancelled';
            break;
        case "DISABLED":
            resultMessage = 'Biometric authentication has been disabled';
            break;
        case "ERROR":
            resultMessage = 'There was an error in authentication';
            break;
        case "SUCCESS":
            resultMessage = 'Successfully authenticated';
            break;
        default:
            resultMessage = '';
            break;
    }






    return (
        <View style={styles.container}>

            <View style={styles.content}>


                {(facialRecognitionAvailable || fingerprintAvailable || irisAvailable) && result == "" ? (
                    <Button title="Authenticate" onPress={authenticate} />

                ) : null}


                {result == "SUCCESS" ? <Button title="LOGOUT" onPress={logout} /> : null}

            </View>


            <View style={styles.ad}>
                {showBanner()}
            </View>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
    },

    ad: {
        backgroundColor: 'red',
        width: '100%',
        alignItems: 'flex-start',
        top: -50,
    }
});
