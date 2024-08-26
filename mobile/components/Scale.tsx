import React, { useState } from "react";
import { StyleSheet, View, Text, Dimensions, TouchableOpacity} from "react-native";
import { Slider } from '@react-native-assets/slider'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faSortDown, faSortUp, faBars, faEdit} from "@fortawesome/free-solid-svg-icons";
import { useMutation } from "@apollo/client";
import variables from "../styles.variables";
import { ScaleData } from "../types/scale";
import ScaleQueries from "../queries/scale";
import { LinearGradient } from 'expo-linear-gradient'

interface ScaleProps {
    handleEdit: (scale: ScaleData) => void
    scale: ScaleData
}
export default function Scale(props: ScaleProps) {
    const [expandScale, setExpandScale] = useState<Boolean>(false)

    const [updateScaleSliderValue] = useMutation(ScaleQueries.UPDATE_SCALE)

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <FontAwesomeIcon icon={faBars} style={styles.header.dragNDrop} size={20}/>
                </TouchableOpacity>
                <Text style={styles.header.goal}>{props.scale.goal}</Text>
                <TouchableOpacity style={styles.header.editIcon} onPress={()=>props.handleEdit(props.scale)}>
                    <FontAwesomeIcon icon={faEdit} style={styles.header.editIcon.icon} size={20}/>
                </TouchableOpacity>
            </View>
            <View style={styles.sliderContainer}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={['red', 'green']}
                style={styles.slider.track}
              />
              <Slider
                  value={props.scale.sliderValue}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  slideOnTap={false}
                  style={styles.slider}
                  thumbStyle={styles.slider.thumb}
                  trackStyle={{backgroundColor: 'transparent'}}
                  onSlidingComplete={(value)=>updateScaleSliderValue({
                      variables: {
                          id: props.scale.id,
                          sliderValue: value
                      }
                  })}
              />
            </View>
            { expandScale &&
                <View style={styles.explanations}>
                    <View style={styles.explanations.section}>
                        <Text style={styles.explanations.title}>Chasing Success</Text>
                        <Text style={styles.explanations.chasingSuccessDescription}>{props.scale.chasingSuccessDescription}</Text>
                    </View> 
                    <View style={styles.explanations.section}>
                        <Text style={styles.explanations.title}>Avoiding Failure</Text>
                        <Text style={styles.explanations.avoidingFailureDescription}>{props.scale.avoidingFailureDescription}</Text>
                    </View> 
                </View>
            }
            <TouchableOpacity style={styles.expand} onPress={()=>setExpandScale(!expandScale)}>
                <FontAwesomeIcon icon={expandScale ? faSortUp : faSortDown} size={25} style={expandScale ? styles.flippedIcon : undefined}/>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,

        paddingHorizontal: 30,
        paddingTop: 10,
        paddingBottom: 20,

        elevation: 3,
        backgroundColor: variables.primary,
        width: Dimensions.get('window').width * 0.9,
        maxWidth: 950,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        dragNDrop: {
          color: variables.secondary
        },
        editIcon: {
            elevation: 3,
            borderRadius: 5,
            padding: 5,

            icon: { 
              color: variables.secondary 
            },
        } as const,

        goal: {
            color: variables.textPrimary,
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
        } as const
    },
    sliderContainer:{
      justifyContent: 'center',
      marginTop: 20
    },
    slider: {
        position: 'absolute',
        width: '100%',
        height: 40,
        thumb: {
            borderRadius: 30,
            backgroundColor: variables.secondary,

            height: 35,
            width: 35,
        },
        track: {
            height: 25,
            borderRadius: 15,
        }
    },
    explanations: {
        margin: -10,
        marginTop: 30,
        padding: 10,

        section: {
            marginBottom: 10,
        } as const,
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: variables.secondary
        } as const,
        chasingSuccessDescription: { color: variables.secondary },
        avoidingFailureDescription: { color: variables.secondary }
    },
    expand: {
        backgroundColor: variables.highlight,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        margin: -30,
        marginTop: 30,
        paddingBottom: 10,

        alignItems: 'center',
        justifyContent: 'center',
    },
    flippedIcon: { // fixes icon positioning when it is flipped
        marginTop: 10,
        marginBottom: -10,
    }
})
