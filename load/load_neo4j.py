#!/usr/bin/env python

# setup steps:
# sudo easy_install py2neo
# sudo easy_install oauth2
# http://book.py2neo.org/en/latest/index.html#
# https://github.com/simplegeo/python-oauth2
# If you don't have easy_install (ubuntu users): sudo apt-get install python-setuptools

import sys
import oauth2 as oauth
import simplejson
import codecs
import urlparse
from py2neo import neo4j, cypher

PERSON = "person"
LINKEDIN = "linkedin"

if len(sys.argv) < 4:
	print "Usage: All fields are required.\n\t load consumer_key consumer_secret oauth_token oauth_token_secret"
	sys.exit(1)

KEY = sys.argv[1]
SECRET = sys.argv[2]
OAUTH_TOKEN = sys.argv[3]
OAUTH_TOKEN_SECRET = sys.argv[4]

nodes = dict() 

if __name__ == '__main__':

	# configure oauth
	consumer = oauth.Consumer(key=KEY, secret=SECRET)
	token = oauth.Token(key=OAUTH_TOKEN, secret=OAUTH_TOKEN_SECRET)
	client = oauth.Client(consumer, token)

	resp, content = client.request('http://api.linkedin.com/v1/people/~?format=json')
 	subjectProfile = simplejson.loads(content)
  
	# get connections
	resp, content = client.request('http://api.linkedin.com/v1/people/~/connections?format=json')
	results = simplejson.loads(content)    

	# Attach to the graph db instance
	graph_db = neo4j.GraphDatabaseService("http://localhost:7474/db/data/")
	graph_db.get_or_create_index(neo4j.Node, PERSON)
	graph_db.get_or_create_index(neo4j.Relationship, LINKEDIN)

	# Create root subject node
	subject = "%s %s" % (subjectProfile["firstName"].replace(",", " "), subjectProfile["lastName"].replace(",", " "))
	nodes[subject] = graph_db.get_or_create_indexed_node(PERSON, "name", subject, {"name": subject, "subject": True}) 
	print 'Added', subject


	# iterate over all the links
	for result in results["values"]:
		link = "%s %s" % (result["firstName"].replace(",", " "), result["lastName"].replace(",", " "))

		if link == 'private private':
			# skip private people
			continue

		if link not in nodes:
			# Create node for this connection
			nodes[link] = graph_db.get_or_create_indexed_node(PERSON, "name", link, {"name": link})
			print 'Added', link

		# Create path from subject to one of the subject's links
		nodes[subject].get_or_create_path(LINKEDIN, nodes[link])
		print "Linked", subject, link 

		# Get shared connections
		sharedUrl = "https://api.linkedin.com/v1/people/%s:(relation-to-viewer:(related-connections))?format=json" % result["id"]
		resp, content = client.request(sharedUrl)
		rels = simplejson.loads(content)
		try:
			for rel in rels['relationToViewer']['relatedConnections']['values']:
				sec = "%s %s" % (rel["firstName"].replace(",", " "), rel["lastName"].replace(",", " "))
				if sec not in nodes:
					nodes[sec] = graph_db.get_or_create_indexed_node(PERSON, "name", sec, {"name": sec}) 
					print 'Added', sec
				# Create path among 1st degree links
				nodes[link].get_or_create_path(LINKEDIN, nodes[sec])
				print "Linked", link, sec 
		except:
			pass

