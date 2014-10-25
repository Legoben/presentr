from tornado import web, ioloop
import os
import uuid




class IndexHandler(web.RequestHandler):
    def get(self, *args, **kwargs):
        self.render("templates/index.html")

print("Restarted!")

app = web.Application([
     (r'/', IndexHandler),
     (r'/static/(.*)', web.StaticFileHandler, {'path': "static"}),

], debug=True)

if __name__ == '__main__':
    app.listen(9009)
    ioloop.IOLoop.instance().start()