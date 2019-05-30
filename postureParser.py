#!/usr/bin/env python


#posture parser
import csv


def posParse():
    rString = []
    with open('PostureReminders.csv') as file:
        reader = csv.reader(file, delimiter= ',')
        for row in reader:
            for string in row:
                rString.append(string)
            #end string for
        #end row for
    #end csv open with
    return rString
#end posParse func



#theList = posParse()

#print theList
