.PHONY: rpm deb

all: rpm deb

rpm:
	docker run --rm -it -v `pwd`/server:/root/rpmbuild/server \
			-v `pwd`/analytics:/root/rpmbuild/analytics \
			-v `pwd`/.git:/root/rpmbuild/.git \
			-v `pwd`/build/rpmbuild:/root/rpmbuild/rpm \
			-v `pwd`/dist/RPMS:/root/rpmbuild/RPMS \
			-e "NODE_VERSION=6.14.0" \
			-e "HASTIC_RELEASE_VERSION=`cat server/package.json| jq -r .version | sed 's/-/_/g'`" \
			hastic/rpmbuilder rpmbuild -bb rpm/hastic-server.spec
